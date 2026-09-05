package com.hometuitions.backend.notification.service.impl;

import com.hometuitions.backend.notification.service.PushGateway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Dev/test stand-in, same reasoning as ConsoleSmsGateway (Phase 4) - logs instead of
 * calling Firebase, so local dev/CI don't need real FCM credentials. Replace with a
 * real firebase-admin-backed implementation before any non-dev deployment.
 */
@Service
public class ConsolePushGateway implements PushGateway {

    private static final Logger log = LoggerFactory.getLogger(ConsolePushGateway.class);

    @Override
    public void send(String fcmToken, String title, String body, Map<String, Object> data) {
        log.info("[DEV PUSH] to {}: {} - {} {}", fcmToken, title, body, data);
    }
}
