package com.hometuitions.backend.booking.entity;

/** See docs/phase2/03-low-level-design.md  1 - Booking State Machine. */
public enum BookingStatus {
    PENDING_TUTOR_ACTION, REJECTED, PENDING_PAYMENT, EXPIRED,
    CONFIRMED, COMPLETED, DISPUTED, CANCELLED
}
