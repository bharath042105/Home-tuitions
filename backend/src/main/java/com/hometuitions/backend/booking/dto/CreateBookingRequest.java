package com.hometuitions.backend.booking.dto;

import com.hometuitions.backend.booking.entity.Booking;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateBookingRequest(
        @NotNull UUID tutorId,
        /** Only read when the caller is a PARENT - a STUDENT caller always books for
         *  themselves regardless of what's sent here (see BookingController). */
        UUID studentProfileId,
        @NotBlank String subject,
        @NotNull OffsetDateTime startTime,
        @NotNull OffsetDateTime endTime,
        @NotNull Booking.Mode mode
) {
}
