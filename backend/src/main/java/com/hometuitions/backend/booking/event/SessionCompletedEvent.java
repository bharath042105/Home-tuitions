package com.hometuitions.backend.booking.event;

import java.util.UUID;

/** Published once a booking transitions to COMPLETED - the payment module listens to
 *  release held funds (minus commission) to the tutor. */
public record SessionCompletedEvent(UUID bookingId, UUID tutorProfileId) {
}
