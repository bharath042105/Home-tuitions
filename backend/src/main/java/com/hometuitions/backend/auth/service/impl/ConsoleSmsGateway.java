package com.hometuitions.backend.auth.service.impl;

import com.hometuitions.backend.auth.service.SmsGateway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Dev/test stand-in for a real SMS gateway - logs instead of sending, so local
 * development and CI don't need real provider credentials. Replace with a real
 * provider-backed implementation (behind the same SmsGateway interface) before
 * any non-dev deployment.
 */
@Service
public class ConsoleSmsGateway implements SmsGateway {

    private static final Logger log = LoggerFactory.getLogger(ConsoleSmsGateway.class);

    @Override
    public void sendOtp(String phone, String code) {
        log.info("[DEV SMS] OTP for {}: {}", phone, code);
    }
}
