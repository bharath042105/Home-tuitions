package com.hometuitions.backend.classroom.dto;

import com.hometuitions.backend.classroom.entity.Dispute;

import java.time.Instant;
import java.util.UUID;

public record DisputeResponse(
        UUID id, UUID bookingId, String reason, Dispute.Status status,
        String resolution, Instant createdAt, Instant resolvedAt
) {
    public static DisputeResponse from(Dispute dispute) {
        return new DisputeResponse(dispute.getId(), dispute.getBookingId(), dispute.getReason(),
                dispute.getStatus(), dispute.getResolution(), dispute.getCreatedAt(), dispute.getResolvedAt());
    }
}
