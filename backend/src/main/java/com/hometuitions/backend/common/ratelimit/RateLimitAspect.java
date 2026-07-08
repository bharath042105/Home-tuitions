package com.hometuitions.backend.common.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Duration;

/**
 * Fixed-window counter (INCR + EXPIRE on first hit) rather than a true token bucket -
 * simpler to reason about and sufficient for the abuse patterns this guards against
 * (credential stuffing, OTP brute-force). Keyed by bucket name + client IP; SRS FR-1.6
 * calls for "+identifier" (email/phone) too, which would need reading the request body
 * before controller binding - deferred until a concrete abuse case justifies the
 * added complexity of a caching body-reading filter.
 */
@Aspect
@Component
public class RateLimitAspect {

    private final StringRedisTemplate redisTemplate;

    // IP-keyed, so every request from the same machine shares one bucket per endpoint -
    // fine in production (each real client has its own IP) but during local dev/manual
    // testing everything comes from localhost, so a handful of test logins across
    // different roles exhausts it immediately. Off by default only in the "dev" Spring
    // profile (see application.yml); production keeps enforcing it unconditionally.
    @Value("${app.ratelimit.enabled:true}")
    private boolean enabled;

    public RateLimitAspect(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Around("@annotation(rateLimited)")
    public Object enforce(ProceedingJoinPoint joinPoint, RateLimited rateLimited) throws Throwable {
        if (!enabled) {
            return joinPoint.proceed();
        }

        String clientIp = currentClientIp();
        String key = "ratelimit:" + rateLimited.bucket() + ":" + clientIp;

        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1L) {
            redisTemplate.expire(key, Duration.ofMinutes(rateLimited.refillMinutes()));
        }
        if (count != null && count > rateLimited.capacity()) {
            throw new RateLimitExceededException(
                    "Too many requests - please try again in a few minutes");
        }

        return joinPoint.proceed();
    }

    private String currentClientIp() {
        var attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return "unknown";
        }
        HttpServletRequest request = attrs.getRequest();
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
