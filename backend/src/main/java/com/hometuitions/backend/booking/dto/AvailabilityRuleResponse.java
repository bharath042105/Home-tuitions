package com.hometuitions.backend.booking.dto;

import com.hometuitions.backend.booking.entity.AvailabilityRule;

import java.time.LocalTime;
import java.util.UUID;

public record AvailabilityRuleResponse(UUID id, int dayOfWeek, LocalTime startTime, LocalTime endTime) {
    public static AvailabilityRuleResponse from(AvailabilityRule rule) {
        return new AvailabilityRuleResponse(rule.getId(), rule.getDayOfWeek(), rule.getStartTime(), rule.getEndTime());
    }
}
