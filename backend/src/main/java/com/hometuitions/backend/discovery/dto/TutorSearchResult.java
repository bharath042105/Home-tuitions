package com.hometuitions.backend.discovery.dto;

import com.hometuitions.backend.user.dto.TutorSearchProjection;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/** Serializable (not a projection interface) so it can be cached in Redis as JSON. */
public record TutorSearchResult(
        UUID id,
        String displayName,
        String bio,
        List<String> subjects,
        BigDecimal hourlyRate,
        String teachingMode,
        BigDecimal avgRating,
        Integer reviewCount,
        Double distanceKm
) implements Serializable {

    public static TutorSearchResult from(TutorSearchProjection projection) {
        List<String> subjects = projection.getSubjectsCsv() == null || projection.getSubjectsCsv().isBlank()
                ? List.of()
                : Arrays.asList(projection.getSubjectsCsv().split(","));

        return new TutorSearchResult(
                projection.getId(),
                projection.getDisplayName(),
                projection.getBio(),
                subjects,
                projection.getHourlyRate(),
                projection.getTeachingMode(),
                projection.getAvgRating(),
                projection.getReviewCount(),
                projection.getDistanceKm() != null ? Math.round(projection.getDistanceKm() * 10) / 10.0 : null
        );
    }
}
