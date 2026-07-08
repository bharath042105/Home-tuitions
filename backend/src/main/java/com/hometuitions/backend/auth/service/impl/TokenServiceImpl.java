package com.hometuitions.backend.auth.service.impl;

import com.hometuitions.backend.auth.entity.User;
import com.hometuitions.backend.auth.repository.UserRepository;
import com.hometuitions.backend.auth.service.TokenService;
import com.hometuitions.backend.common.exception.InvalidTokenException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.keygen.KeyGenerators;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Set;
import java.util.UUID;

/**
 * Refresh tokens use a double Redis index so both lookups TokenService needs are O(1):
 *   - "refresh:session:{userId}:{deviceId}" -> tokenHash   (enables revoke / revokeAll via SCAN by userId)
 *   - "refresh:lookup:{tokenHash}"          -> "{userId}:{deviceId}" (enables rotate() to resolve a
 *                                              presented opaque token without the caller supplying userId)
 * Both entries are written/deleted together so they never drift out of sync.
 * See docs/phase2/03-low-level-design.md  3.
 */
@Service
public class TokenServiceImpl implements TokenService {

    private static final Duration ACCESS_TOKEN_TTL = Duration.ofMinutes(15);
    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(7);

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;
    private final Key signingKey;

    public TokenServiceImpl(StringRedisTemplate redisTemplate,
                             UserRepository userRepository,
                             @Value("${app.jwt.secret}") String jwtSecret) {
        this.redisTemplate = redisTemplate;
        this.userRepository = userRepository;
        this.signingKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecret));
    }

    @Override
    public String issueAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ACCESS_TOKEN_TTL)))
                .signWith(signingKey)
                .compact();
    }

    @Override
    public String issueRefreshToken(User user, String deviceId) {
        String rawToken = KeyGenerators.string().generateKey() + KeyGenerators.string().generateKey();
        String tokenHash = hash(rawToken);
        String userId = user.getId().toString();

        redisTemplate.opsForValue().set(sessionKey(userId, deviceId), tokenHash, REFRESH_TOKEN_TTL);
        redisTemplate.opsForValue().set(lookupKey(tokenHash), userId + ":" + deviceId, REFRESH_TOKEN_TTL);

        return rawToken;
    }

    @Override
    public RotatedTokens rotate(String presentedRefreshToken, String deviceId) {
        String tokenHash = hash(presentedRefreshToken);
        String lookupValue = redisTemplate.opsForValue().get(lookupKey(tokenHash));
        if (lookupValue == null) {
            // Not found means expired, already revoked, or already rotated once - in the
            // last case this is a replay of a used token and we fail closed.
            throw new InvalidTokenException("Refresh token is invalid, expired, or already used");
        }

        String[] parts = lookupValue.split(":", 2);
        String userId = parts[0];
        String boundDeviceId = parts[1];
        if (!boundDeviceId.equals(deviceId)) {
            throw new InvalidTokenException("Refresh token was not issued for this device");
        }

        // Delete both index entries before issuing new ones - this is the rotation step
        // that makes a replayed old token fail on its next use.
        redisTemplate.delete(lookupKey(tokenHash));
        redisTemplate.delete(sessionKey(userId, deviceId));

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new InvalidTokenException("Account no longer exists"));

        String newAccessToken = issueAccessToken(user);
        String newRefreshToken = issueRefreshToken(user, deviceId);
        return new RotatedTokens(newAccessToken, newRefreshToken);
    }

    @Override
    public void revoke(String userId, String deviceId) {
        String tokenHash = redisTemplate.opsForValue().get(sessionKey(userId, deviceId));
        if (tokenHash != null) {
            redisTemplate.delete(lookupKey(tokenHash));
        }
        redisTemplate.delete(sessionKey(userId, deviceId));
    }

    @Override
    public void revokeAll(String userId) {
        // TODO(production): KEYS blocks Redis on large keyspaces - switch to a cursor-based
        // SCAN once session volume justifies it (LLD  3). Fine at MVP scale (bounded by
        // per-user device count, not total keyspace size).
        Set<String> sessionKeys = redisTemplate.keys("refresh:session:" + userId + ":*");
        if (sessionKeys == null || sessionKeys.isEmpty()) {
            return;
        }
        for (String sessionKey : sessionKeys) {
            String tokenHash = redisTemplate.opsForValue().get(sessionKey);
            if (tokenHash != null) {
                redisTemplate.delete(lookupKey(tokenHash));
            }
        }
        redisTemplate.delete(sessionKeys);
    }

    private String sessionKey(String userId, String deviceId) {
        return "refresh:session:" + userId + ":" + deviceId;
    }

    private String lookupKey(String tokenHash) {
        return "refresh:lookup:" + tokenHash;
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(digest.digest(token.getBytes()));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
