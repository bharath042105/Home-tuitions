package com.hometuitions.backend.notification.controller;

import com.hometuitions.backend.notification.dto.NotificationResponse;
import com.hometuitions.backend.notification.dto.RegisterDeviceTokenRequest;
import com.hometuitions.backend.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications/me")
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> list(Authentication authentication) {
        return notificationService.listForUser(UUID.fromString(authentication.getName())).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(Authentication authentication, @PathVariable UUID id) {
        notificationService.markRead(id, UUID.fromString(authentication.getName()));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/device-tokens")
    public ResponseEntity<Void> registerDeviceToken(Authentication authentication,
                                                     @Valid @RequestBody RegisterDeviceTokenRequest request) {
        notificationService.registerDeviceToken(
                UUID.fromString(authentication.getName()), request.fcmToken(), request.platform());
        return ResponseEntity.ok().build();
    }
}
