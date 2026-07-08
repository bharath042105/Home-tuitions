package com.hometuitions.backend.auth.service;

/**
 * Thin seam over whichever SMS provider is chosen in production (e.g. MSG91, Twilio).
 * Kept as a one-method interface so swapping providers touches one class.
 */
public interface SmsGateway {
    void sendOtp(String phone, String code);
}
