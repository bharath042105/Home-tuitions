package com.hometuitions.backend.notification.repository;

import com.hometuitions.backend.notification.entity.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {
    List<DeviceToken> findByUserId(UUID userId);
    boolean existsByUserIdAndFcmToken(UUID userId, String fcmToken);
}
