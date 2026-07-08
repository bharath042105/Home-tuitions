package com.hometuitions.backend.booking.service;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.entity.BookingStatus;
import com.hometuitions.backend.booking.exception.IllegalBookingTransitionException;
import com.hometuitions.backend.common.audit.AuditLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

/**
 * Exercises every edge in the allowed-transition map from
 * docs/phase2/03-low-level-design.md  1 - both the edges that should succeed and a
 * representative set that should be rejected, since an over-permissive edge here would
 * let a booking (and the money attached to it) reach an inconsistent state silently.
 */
class BookingStateMachineTest {

    private BookingStateMachine stateMachine;
    private AuditLogService auditLogService;

    @BeforeEach
    void setUp() {
        auditLogService = mock(AuditLogService.class);
        stateMachine = new BookingStateMachine(auditLogService);
    }

    private Booking bookingWithStatus(BookingStatus status) {
        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setStatus(status);
        return booking;
    }

    @ParameterizedTest
    @CsvSource({
            "PENDING_TUTOR_ACTION, REJECTED",
            "PENDING_TUTOR_ACTION, PENDING_PAYMENT",
            "PENDING_TUTOR_ACTION, EXPIRED",
            "PENDING_TUTOR_ACTION, CANCELLED",
            "PENDING_PAYMENT, CONFIRMED",
            "PENDING_PAYMENT, EXPIRED",
            "PENDING_PAYMENT, CANCELLED",
            "CONFIRMED, COMPLETED",
            "CONFIRMED, DISPUTED",
            "CONFIRMED, CANCELLED",
            "DISPUTED, COMPLETED",
            "DISPUTED, CANCELLED",
    })
    void allowsEveryDocumentedEdge(BookingStatus from, BookingStatus to) {
        Booking booking = bookingWithStatus(from);
        stateMachine.transition(booking, to, "actor");
        assertThat(booking.getStatus()).isEqualTo(to);
    }

    @ParameterizedTest
    @CsvSource({
            "PENDING_TUTOR_ACTION, CONFIRMED",   // must go through PENDING_PAYMENT first
            "PENDING_TUTOR_ACTION, COMPLETED",
            "PENDING_PAYMENT, DISPUTED",         // disputes only make sense once CONFIRMED
            "REJECTED, PENDING_PAYMENT",         // terminal state, no way back in
            "COMPLETED, CANCELLED",              // terminal state
            "CANCELLED, CONFIRMED",              // terminal state
            "EXPIRED, PENDING_TUTOR_ACTION",     // terminal state
    })
    void rejectsUndocumentedEdges(BookingStatus from, BookingStatus to) {
        Booking booking = bookingWithStatus(from);
        assertThatThrownBy(() -> stateMachine.transition(booking, to, "actor"))
                .isInstanceOf(IllegalBookingTransitionException.class);
        assertThat(booking.getStatus()).isEqualTo(from); // rejected transition must not mutate state
    }

    @Test
    void recordsAnAuditLogEntryOnEverySuccessfulTransition() {
        Booking booking = bookingWithStatus(BookingStatus.CONFIRMED);
        stateMachine.transition(booking, BookingStatus.COMPLETED, "tutor-123");

        org.mockito.Mockito.verify(auditLogService).record(
                org.mockito.ArgumentMatchers.eq("tutor-123"),
                org.mockito.ArgumentMatchers.eq("BOOKING_STATUS_CHANGE"),
                org.mockito.ArgumentMatchers.eq(booking.getId().toString()),
                org.mockito.ArgumentMatchers.anyMap());
    }
}
