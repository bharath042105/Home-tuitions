package com.hometuitions.backend.booking.service;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.entity.BookingStatus;
import com.hometuitions.backend.booking.exception.IllegalBookingTransitionException;
import com.hometuitions.backend.common.audit.AuditLogService;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.Set;

import static com.hometuitions.backend.booking.entity.BookingStatus.*;

/**
 * The single place that enforces which status transitions are legal - see
 * docs/phase2/03-low-level-design.md  1. Kept as a static edge map (not a full
 * state-machine framework) since the graph is small and static.
 */
@Component
public class BookingStateMachine {

    private static final Map<BookingStatus, Set<BookingStatus>> ALLOWED = Map.of(
            PENDING_TUTOR_ACTION, Set.of(REJECTED, PENDING_PAYMENT, EXPIRED, CANCELLED),
            PENDING_PAYMENT, Set.of(CONFIRMED, EXPIRED, CANCELLED),
            CONFIRMED, Set.of(COMPLETED, DISPUTED, CANCELLED),
            DISPUTED, Set.of(COMPLETED, CANCELLED)
    );

    private final AuditLogService auditLogService;

    public BookingStateMachine(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    public void transition(Booking booking, BookingStatus target, String actorUserId) {
        Set<BookingStatus> allowed = ALLOWED.getOrDefault(booking.getStatus(), Set.of());
        if (!allowed.contains(target)) {
            throw new IllegalBookingTransitionException(booking.getId(), booking.getStatus(), target);
        }
        booking.setStatus(target);
        booking.setLastTransitionAt(Instant.now());
        auditLogService.record(actorUserId, "BOOKING_STATUS_CHANGE", booking.getId().toString(),
                Map.of("to", target.name()));
    }
}
