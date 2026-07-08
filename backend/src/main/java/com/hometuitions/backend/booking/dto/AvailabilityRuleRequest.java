package com.hometuitions.backend.booking.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record AvailabilityRuleRequest(
        @Min(0) @Max(6) int dayOfWeek,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime
) {
    public AvailabilityRuleRequest {
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }
    }
}
