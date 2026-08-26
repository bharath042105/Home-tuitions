package com.hometuitions.backend.leads.dto;

import com.hometuitions.backend.leads.entity.ContactMessage;
import com.hometuitions.backend.leads.entity.LeadStatus;

import java.time.Instant;
import java.util.UUID;

public record ContactMessageResponse(
        UUID id,
        String name,
        String phone,
        String email,
        String message,
        LeadStatus status,
        Instant createdAt
) {
    public static ContactMessageResponse from(ContactMessage contactMessage) {
        return new ContactMessageResponse(
                contactMessage.getId(),
                contactMessage.getName(),
                contactMessage.getPhone(),
                contactMessage.getEmail(),
                contactMessage.getMessage(),
                contactMessage.getStatus(),
                contactMessage.getCreatedAt());
    }
}
