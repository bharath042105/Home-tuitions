package com.hometuitions.backend.support.dto;

import com.hometuitions.backend.support.entity.TicketMessage;

import java.time.Instant;
import java.util.UUID;

public record TicketMessageResponse(UUID id, UUID senderId, String body, Instant sentAt) {
    public static TicketMessageResponse from(TicketMessage message) {
        return new TicketMessageResponse(message.getId(), message.getSenderId(), message.getBody(), message.getSentAt());
    }
}
