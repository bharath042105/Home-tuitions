package com.hometuitions.backend.booking.dto;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.entity.BookingStatus;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        UUID studentId,
        UUID parentId,
        UUID tutorId,
        String subject,
        Booking.Mode mode,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        BookingStatus status,
        Instant paymentDeadline,
        Instant createdAt
) {
    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getStudentId(),
                booking.getParentId(),
                booking.getTutorId(),
                booking.getSubject(),
                booking.getMode(),
                booking.startTime(),
                booking.endTime(),
                booking.getStatus(),
                booking.getPaymentDeadline(),
                booking.getCreatedAt());
    }
}
