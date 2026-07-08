package com.hometuitions.backend.chat.event;

import java.util.UUID;

/** Published so the notification module can react (notify the other participant)
 *  without chat depending on notification directly - same event-based decoupling
 *  used for BookingAcceptedEvent/BookingCancelledEvent (Phase 9). */
public record ChatMessageSentEvent(UUID bookingId, UUID senderId, String body) {
}
