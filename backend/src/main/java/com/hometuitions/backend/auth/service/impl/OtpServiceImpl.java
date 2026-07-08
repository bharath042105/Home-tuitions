package com.hometuitions.backend.auth.service.impl;

import com.hometuitions.backend.auth.service.OtpService;
import com.hometuitions.backend.auth.service.SmsGateway;
import com.hometuitions.backend.common.exception.InvalidTokenException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
public class OtpServiceImpl implements OtpService {

    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final int MAX_ATTEMPTS = 3;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StringRedisTemplate redisTemplate;
    private final SmsGateway smsGateway;

    public OtpServiceImpl(StringRedisTemplate redisTemplate, SmsGateway smsGateway) {
        this.redisTemplate = redisTemplate;
        this.smsGateway = smsGateway;
    }

    @Override
    public void generateAndSend(String phone) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        redisTemplate.opsForValue().set(codeKey(phone), code, OTP_TTL);
        redisTemplate.delete(attemptsKey(phone)); // fresh attempt counter for the new code
        smsGateway.sendOtp(phone, code);
    }

    @Override
    public void verify(String phone, String code) {
        String storedCode = redisTemplate.opsForValue().get(codeKey(phone));
        if (storedCode == null) {
            throw new InvalidTokenException("OTP has expired or was never requested");
        }

        Long attempts = redisTemplate.opsForValue().increment(attemptsKey(phone));
        redisTemplate.expire(attemptsKey(phone), OTP_TTL);
        if (attempts != null && attempts > MAX_ATTEMPTS) {
            redisTemplate.delete(codeKey(phone));
            throw new InvalidTokenException("Too many incorrect attempts - request a new OTP");
        }

        if (!storedCode.equals(code)) {
            throw new InvalidTokenException("Incorrect OTP");
        }

        // Correct on this attempt - consume it so it can't be replayed.
        redisTemplate.delete(codeKey(phone));
        redisTemplate.delete(attemptsKey(phone));
    }

    private String codeKey(String phone) {
        return "otp:code:" + phone;
    }

    private String attemptsKey(String phone) {
        return "otp:attempts:" + phone;
    }
}
