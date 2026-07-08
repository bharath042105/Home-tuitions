package com.hometuitions.backend.booking.event;

import java.util.UUID;

public record BookingRejectedEvent(UUID bookingId, UUID studentProfileId, UUID parentProfileId) {
}
