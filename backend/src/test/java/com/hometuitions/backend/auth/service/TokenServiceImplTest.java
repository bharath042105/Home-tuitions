package com.hometuitions.backend.auth.service;

import com.hometuitions.backend.auth.entity.User;
import com.hometuitions.backend.auth.repository.UserRepository;
import com.hometuitions.backend.auth.service.impl.TokenServiceImpl;
import com.hometuitions.backend.common.exception.InvalidTokenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Verifies the refresh-token rotation contract from docs/phase2/03-low-level-design.md  3:
 * a token can be used exactly once, revoke/revokeAll actually remove what was written
 * (regression test for the Phase 3 bug where the write key and delete key didn't match),
 * and a token bound to one device can't be redeemed from another.
 */
class TokenServiceImplTest {

    private StringRedisTemplate redisTemplate;
    private ValueOperations<String, String> valueOps;
    private UserRepository userRepository;
    private TokenServiceImpl tokenService;

    private final Map<String, String> store = new HashMap<>();
    private static final String SECRET = Base64.getEncoder().encodeToString(
            "test-signing-key-that-is-at-least-256-bits-long!".getBytes());

    @BeforeEach
    void setUp() {
        redisTemplate = mock(StringRedisTemplate.class);
        valueOps = mock(ValueOperations.class);
        userRepository = mock(UserRepository.class);
        store.clear();

        when(redisTemplate.opsForValue()).thenReturn(valueOps);

        doAnswer(inv -> {
            store.put(inv.getArgument(0), inv.getArgument(1));
            return null;
        }).when(valueOps).set(anyString(), anyString(), any(Duration.class));

        when(valueOps.get(anyString())).thenAnswer(inv -> store.get((String) inv.getArgument(0)));

        doAnswer(inv -> {
            store.remove((String) inv.getArgument(0));
            return true;
        }).when(redisTemplate).delete(anyString());

        when(redisTemplate.keys(anyString())).thenAnswer(inv -> {
            String pattern = ((String) inv.getArgument(0)).replace("*", "");
            Set<String> matches = new HashSet<>();
            for (String key : store.keySet()) {
                if (key.startsWith(pattern)) matches.add(key);
            }
            return matches;
        });

        doAnswer(inv -> {
            Set<String> keys = inv.getArgument(0);
            store.keySet().removeAll(keys);
            return null;
        }).when(redisTemplate).delete(anySet());

        tokenService = new TokenServiceImpl(redisTemplate, userRepository, SECRET);
    }

    private User testUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setRole(User.Role.STUDENT);
        return user;
    }

    @Test
    void rotate_issuesNewTokensForValidPresentedToken() {
        User user = testUser();
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        String refreshToken = tokenService.issueRefreshToken(user, "device-1");
        var rotated = tokenService.rotate(refreshToken, "device-1");

        assertThat(rotated.accessToken()).isNotBlank();
        assertThat(rotated.refreshToken()).isNotBlank();
        assertThat(rotated.refreshToken()).isNotEqualTo(refreshToken);
    }

    @Test
    void rotate_rejectsReplayOfAnAlreadyRotatedToken() {
        User user = testUser();
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        String refreshToken = tokenService.issueRefreshToken(user, "device-1");
        tokenService.rotate(refreshToken, "device-1"); // first use: succeeds, old token consumed

        assertThatThrownBy(() -> tokenService.rotate(refreshToken, "device-1"))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void rotate_rejectsTokenPresentedFromWrongDevice() {
        User user = testUser();
        String refreshToken = tokenService.issueRefreshToken(user, "device-1");

        assertThatThrownBy(() -> tokenService.rotate(refreshToken, "device-2"))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void revoke_removesTheSessionSoRotateNoLongerWorks() {
        User user = testUser();
        String refreshToken = tokenService.issueRefreshToken(user, "device-1");

        tokenService.revoke(user.getId().toString(), "device-1");

        assertThatThrownBy(() -> tokenService.rotate(refreshToken, "device-1"))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void revokeAll_removesEverySessionForThatUser() {
        User user = testUser();
        String tokenDevice1 = tokenService.issueRefreshToken(user, "device-1");
        String tokenDevice2 = tokenService.issueRefreshToken(user, "device-2");

        tokenService.revokeAll(user.getId().toString());

        assertThatThrownBy(() -> tokenService.rotate(tokenDevice1, "device-1"))
                .isInstanceOf(InvalidTokenException.class);
        assertThatThrownBy(() -> tokenService.rotate(tokenDevice2, "device-2"))
                .isInstanceOf(InvalidTokenException.class);
    }
}
