package com.hometuitions.backend.common.exception;

/** Base type for domain-rule conflicts (e.g. illegal state transitions) mapped to HTTP 409. */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
