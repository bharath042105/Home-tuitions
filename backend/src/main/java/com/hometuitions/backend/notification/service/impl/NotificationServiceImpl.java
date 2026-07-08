package com.hometuitions.backend.notification.service.impl;

import com.hometuitions.backend.notification.entity.DeviceToken;
import com.hometuitions.backend.notification.entity.Notification;
import com.hometuitions.backend.notification.repository.DeviceTokenRepository;
import com.hometuitions.backend.notification.repository.NotificationRepository;
import com.hometuitions.backend.notification.service.NotificationService;
import com.hometuitions.backend.notification.service.PushGateway;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final PushGateway pushGateway;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                    DeviceTokenRepository deviceTokenRepository,
                                    PushGateway pushGateway) {
        this.notificationRepository = notificationRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.pushGateway = pushGateway;
    }

    @Override
    public Notification notify(UUID userId, String type, String title, String body, Map<String, Object> payload) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setPayload(payload);
        Notification saved = notificationRepository.save(notification);

        for (DeviceToken token : deviceTokenRepository.findByUserId(userId)) {
            try {
                pushGateway.send(token.getFcmToken(), title, body, payload);
            } catch (Exception e) {
                // Best-effort: one dead/expired token must never fail the notification
                // write itself, and must never fail whatever business transaction
                // triggered this notify() call (e.g. accepting a booking).
                log.warn("Push delivery failed for user {} token {}: {}", userId, token.getId(), e.getMessage());
            }
        }
        return saved;
    }

    @Override
    public List<Notification> listForUser(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public void markRead(UUID notificationId, UUID callerUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        if (!notification.getUserId().equals(callerUserId)) {
            throw new AccessDeniedException("This notification does not belong to you");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void registerDeviceToken(UUID userId, String fcmToken, DeviceToken.Platform platform) {
        if (deviceTokenRepository.existsByUserIdAndFcmToken(userId, fcmToken)) {
            return; // already registered - re-registering the same token is a no-op, not an error
        }
        DeviceToken token = new DeviceToken();
        token.setUserId(userId);
        token.setFcmToken(fcmToken);
        token.setPlatform(platform);
        deviceTokenRepository.save(token);
    }
}
