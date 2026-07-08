package com.hometuitions.backend.auth.service;

/**
 * SRS FR-1.3/FR-1.6: OTP expires in 5 min, max 3 verify attempts.
 * See docs/phase2/02-high-level-design.md  2.2.
 */
public interface OtpService {

    void generateAndSend(String phone);

    /** Throws InvalidTokenException on mismatch, expiry, or exceeding max attempts. */
    void verify(String phone, String code);
}
