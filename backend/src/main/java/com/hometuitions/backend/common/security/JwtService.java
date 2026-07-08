package com.hometuitions.backend.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Base64;
import java.util.List;

/**
 * Shared JWT verification, used by both JwtAuthFilter (HTTP requests) and
 * StompAuthChannelInterceptor (WebSocket CONNECT frames, Phase 10) - extracted so
 * the two auth paths can't drift out of sync on how a token is validated.
 */
@Component
public class JwtService {

    private final Key signingKey;

    public JwtService(@Value("${app.jwt.secret}") String jwtSecret) {
        this.signingKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecret));
    }

    /** Returns null (not throws) on any validation failure - callers treat a null
     *  result as "unauthenticated" rather than propagating a parsing exception. */
    public Authentication authenticate(String bearerToken) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith((SecretKey) signingKey)
                    .build()
                    .parseSignedClaims(bearerToken)
                    .getPayload();

            String userId = claims.getSubject();
            String role = claims.get("role", String.class);
            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
            return new UsernamePasswordAuthenticationToken(userId, null, authorities);
        } catch (Exception ex) {
            return null;
        }
    }
}
