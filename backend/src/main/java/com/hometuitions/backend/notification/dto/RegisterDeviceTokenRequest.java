package com.hometuitions.backend.notification.dto;

import com.hometuitions.backend.notification.entity.DeviceToken;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterDeviceTokenRequest(@NotBlank String fcmToken, @NotNull DeviceToken.Platform platform) {
}
