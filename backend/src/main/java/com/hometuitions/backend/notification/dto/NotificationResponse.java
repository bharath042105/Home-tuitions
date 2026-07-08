package com.hometuitions.backend.notification.dto;

import com.hometuitions.backend.notification.entity.Notification;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record NotificationResponse(UUID id, String type, Map<String, Object> payload, boolean read, Instant createdAt) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(), notification.getType(), notification.getPayload(),
                notification.isRead(), notification.getCreatedAt());
    }
}
