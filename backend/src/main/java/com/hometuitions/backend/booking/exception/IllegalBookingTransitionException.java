package com.hometuitions.backend.booking.exception;

import com.hometuitions.backend.common.exception.ConflictException;

/**
 * Thrown by BookingStateMachine when a requested status transition is not in the
 * allowed edge set. See docs/phase2/03-low-level-design.md - Booking State Machine.
 */
public class IllegalBookingTransitionException extends ConflictException {
    public IllegalBookingTransitionException(Object bookingId, Object fromStatus, Object toStatus) {
        super("Cannot transition booking %s from %s to %s".formatted(bookingId, fromStatus, toStatus));
    }
}
