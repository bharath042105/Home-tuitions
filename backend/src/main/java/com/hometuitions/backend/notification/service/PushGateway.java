package com.hometuitions.backend.notification.service;

import java.util.Map;

/**
 * Thin seam over FCM, same shape as auth's SmsGateway (Phase 4) - one method,
 * swappable implementation, so wiring in real Firebase Admin SDK later touches one class.
 */
public interface PushGateway {
    void send(String fcmToken, String title, String body, Map<String, Object> data);
}
