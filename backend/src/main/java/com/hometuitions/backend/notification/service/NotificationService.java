package com.hometuitions.backend.notification.service;

import com.hometuitions.backend.notification.entity.DeviceToken;
import com.hometuitions.backend.notification.entity.Notification;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface NotificationService {

    /** Persists an in-app notification row and best-effort pushes to every device
     *  registered for this user - a push failure never fails the caller's own
     *  transaction (see docs/phase10/README.md). */
    Notification notify(UUID userId, String type, String title, String body, Map<String, Object> payload);

    List<Notification> listForUser(UUID userId);

    void markRead(UUID notificationId, UUID callerUserId);

    void registerDeviceToken(UUID userId, String fcmToken, DeviceToken.Platform platform);
}
