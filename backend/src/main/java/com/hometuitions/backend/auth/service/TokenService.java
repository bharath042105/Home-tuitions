package com.hometuitions.backend.auth.service;

import com.hometuitions.backend.auth.entity.User;

/**
 * See docs/phase2/03-low-level-design.md - Auth Token Lifecycle.
 * Access tokens are self-contained JWTs (15 min). Refresh tokens are opaque,
 * stored server-side in Redis keyed by userId+deviceId, and rotated on every use.
 */
public interface TokenService {

    String issueAccessToken(User user);

    String issueRefreshToken(User user, String deviceId);

    /**
     * Validates the presented refresh token against Redis, deletes it (rotation),
     * and issues a new one. Throws InvalidTokenException if not found/expired -
     * this also detects replay of an already-used (and thus deleted) token.
     */
    RotatedTokens rotate(String presentedRefreshToken, String deviceId);

    void revoke(String userId, String deviceId);

    void revokeAll(String userId);

    record RotatedTokens(String accessToken, String refreshToken) {
    }
}
