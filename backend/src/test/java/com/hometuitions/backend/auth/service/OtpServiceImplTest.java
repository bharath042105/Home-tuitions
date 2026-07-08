package com.hometuitions.backend.auth.service;

import com.hometuitions.backend.auth.service.impl.OtpServiceImpl;
import com.hometuitions.backend.common.exception.InvalidTokenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Exercises the OTP lockout/expiry rules from SRS FR-1.3/FR-1.6 (5 min TTL, max 3
 * attempts) against an in-memory fake of the Redis value operations, so the test
 * doesn't need a real Redis instance to verify the business rule.
 */
class OtpServiceImplTest {

    private StringRedisTemplate redisTemplate;
    private ValueOperations<String, String> valueOps;
    private SmsGateway smsGateway;
    private OtpServiceImpl otpService;

    private final Map<String, String> store = new HashMap<>();

    @BeforeEach
    void setUp() {
        redisTemplate = mock(StringRedisTemplate.class);
        valueOps = mock(ValueOperations.class);
        smsGateway = mock(SmsGateway.class);
        store.clear();

        when(redisTemplate.opsForValue()).thenReturn(valueOps);

        doAnswer(inv -> {
            store.put(inv.getArgument(0), inv.getArgument(1));
            return null;
        }).when(valueOps).set(anyString(), anyString(), any(Duration.class));

        when(valueOps.get(anyString())).thenAnswer(inv -> store.get((String) inv.getArgument(0)));

        when(valueOps.increment(anyString())).thenAnswer(inv -> {
            String key = inv.getArgument(0);
            long next = Long.parseLong(store.getOrDefault(key, "0")) + 1;
            store.put(key, String.valueOf(next));
            return next;
        });

        doAnswer(inv -> {
            store.remove((String) inv.getArgument(0));
            return true;
        }).when(redisTemplate).delete(anyString());

        when(redisTemplate.expire(anyString(), any(Duration.class))).thenReturn(true);

        otpService = new OtpServiceImpl(redisTemplate, smsGateway);
    }

    @Test
    void verify_succeedsWithCorrectCode() {
        otpService.generateAndSend("+919876543210");
        String sentCode = store.get("otp:code:+919876543210");

        otpService.verify("+919876543210", sentCode);
        // consumed - a second verify with the same code must fail
        assertThatThrownBy(() -> otpService.verify("+919876543210", sentCode))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void verify_rejectsIncorrectCode() {
        otpService.generateAndSend("+919876543210");

        assertThatThrownBy(() -> otpService.verify("+919876543210", "000000"))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void verify_locksOutAfterMaxAttempts() {
        otpService.generateAndSend("+919876543210");

        for (int i = 0; i < 3; i++) {
            assertThatThrownBy(() -> otpService.verify("+919876543210", "wrong"))
                    .isInstanceOf(InvalidTokenException.class);
        }

        // 4th attempt (even with the wrong code) should report lockout, not "incorrect"
        assertThatThrownBy(() -> otpService.verify("+919876543210", "wrong"))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("Too many");
    }

    @Test
    void verify_rejectsWhenNoCodeWasRequested() {
        assertThatThrownBy(() -> otpService.verify("+919999999999", "123456"))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("expired");
    }
}
