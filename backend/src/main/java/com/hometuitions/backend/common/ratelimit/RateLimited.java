package com.hometuitions.backend.common.ratelimit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Applies a Redis-backed fixed-window rate limit to a controller method, keyed by
 * client IP. Applied selectively (not globally) so normal read endpoints aren't
 * penalized - see docs/phase2/03-low-level-design.md  4.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimited {
    /** Logical bucket name, e.g. "login", "otp-request" - namespaces the Redis key. */
    String bucket();

    /** Max requests allowed per window. */
    int capacity();

    /** Window length in minutes. */
    int refillMinutes();
}
