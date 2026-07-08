package com.hometuitions.backend.support.dto;

import com.hometuitions.backend.support.entity.SupportTicket;

import java.time.Instant;
import java.util.UUID;

public record SupportTicketResponse(UUID id, UUID raisedBy, String subject, SupportTicket.Status status, Instant createdAt) {
    public static SupportTicketResponse from(SupportTicket ticket) {
        return new SupportTicketResponse(ticket.getId(), ticket.getRaisedBy(), ticket.getSubject(), ticket.getStatus(), ticket.getCreatedAt());
    }
}
