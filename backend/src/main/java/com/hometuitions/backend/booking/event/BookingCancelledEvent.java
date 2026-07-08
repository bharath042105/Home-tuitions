package com.hometuitions.backend.booking.event;

import java.util.UUID;

/** See BookingAcceptedEvent for why this is an event rather than a direct call. */
public record BookingCancelledEvent(UUID bookingId, UUID tutorProfileId) {
}
