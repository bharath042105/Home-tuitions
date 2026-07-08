package com.hometuitions.backend.booking.event;

import java.util.UUID;

public record BookingRequestedEvent(UUID bookingId, UUID tutorProfileId) {
}
