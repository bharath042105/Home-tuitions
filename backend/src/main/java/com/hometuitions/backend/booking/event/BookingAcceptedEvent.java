package com.hometuitions.backend.booking.event;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Published (not called directly) so the booking module has no compile-time
 * dependency on payment - the reverse dependency (payment -> booking, for
 * confirmPayment()) already exists, and a direct booking -> payment call here too
 * would create a circular Spring bean graph (BookingServiceImpl needs PaymentService,
 * PaymentServiceImpl needs BookingService) that fails at startup. Events break the cycle.
 */
public record BookingAcceptedEvent(UUID bookingId, UUID tutorProfileId, BigDecimal amount) {
}
