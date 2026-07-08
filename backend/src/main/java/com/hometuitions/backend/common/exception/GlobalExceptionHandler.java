package com.hometuitions.backend.common.exception;

import com.hometuitions.backend.common.ratelimit.RateLimitExceededException;
import com.hometuitions.backend.payment.exception.InvalidWebhookSignatureException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(
                new ErrorResponse("VALIDATION_FAILED", "Request validation failed", fieldErrors, Instant.now()));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ErrorResponse("DUPLICATE_RESOURCE", ex.getMessage(), null, Instant.now()));
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidToken(InvalidTokenException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ErrorResponse("INVALID_TOKEN", ex.getMessage(), null, Instant.now()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ErrorResponse("CONFLICT", ex.getMessage(), null, Instant.now()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ErrorResponse("BAD_CREDENTIALS", ex.getMessage(), null, Instant.now()));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ErrorResponse("NOT_FOUND", ex.getMessage(), null, Instant.now()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMalformedRequest(HttpMessageNotReadableException ex) {
        // Covers both unparseable JSON and validation errors thrown from a DTO's compact
        // record constructor (e.g. AvailabilityRuleRequest's endTime > startTime check) -
        // Jackson wraps both as this exception type, and without this handler our
        // catch-all below would incorrectly report them as 500s instead of 400s.
        return ResponseEntity.badRequest().body(
                new ErrorResponse("MALFORMED_REQUEST", "Request body is invalid", null, Instant.now()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        // Spring Security's ExceptionTranslationFilter normally turns this into a 403,
        // but that filter sits outside DispatcherServlet - by the time an exception
        // reaches this @RestControllerAdvice, it's already been resolved here instead,
        // so without this explicit handler our catch-all below would wrongly 500 it.
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                new ErrorResponse("ACCESS_DENIED", ex.getMessage(), null, Instant.now()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(
                new ErrorResponse("BAD_REQUEST", ex.getMessage(), null, Instant.now()));
    }

    @ExceptionHandler(InvalidWebhookSignatureException.class)
    public ResponseEntity<ErrorResponse> handleInvalidWebhookSignature(InvalidWebhookSignatureException ex) {
        return ResponseEntity.badRequest().body(
                new ErrorResponse("INVALID_WEBHOOK_SIGNATURE", ex.getMessage(), null, Instant.now()));
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleRateLimit(RateLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                new ErrorResponse("RATE_LIMITED", ex.getMessage(), null, Instant.now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        // Was previously swallowed with no logging at all, which made every genuinely
        // unexpected error a dead end - the client got "INTERNAL_ERROR" and there was no
        // way to find the actual stack trace anywhere.
        log.error("Unhandled exception", ex);
        return ResponseEntity.internalServerError().body(
                new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred", null, Instant.now()));
    }

    public record ErrorResponse(String code, String message, Map<String, String> fieldErrors, Instant timestamp) {
    }
}
