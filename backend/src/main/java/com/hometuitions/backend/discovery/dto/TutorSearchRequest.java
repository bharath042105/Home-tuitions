package com.hometuitions.backend.discovery.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TutorSearchRequest(
        @NotNull Double lat,
        @NotNull Double lng,
        @Min(1) Integer radiusKm,
        String subject,
        String mode,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        BigDecimal minRating,
        @Min(0) Integer page,
        @Min(1) @Max(50) Integer size
) {
    public int pageOrDefault() {
        return page != null ? page : 0;
    }

    public int sizeOrDefault() {
        return size != null ? size : 20;
    }

    public double radiusMetersOrDefault() {
        return (radiusKm != null ? radiusKm : 25) * 1000.0;
    }
}
