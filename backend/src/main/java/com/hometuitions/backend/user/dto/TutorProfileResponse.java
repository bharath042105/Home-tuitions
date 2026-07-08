package com.hometuitions.backend.user.dto;

import com.hometuitions.backend.user.entity.TutorProfile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record TutorProfileResponse(
        UUID id,
        UUID userId,
        String displayName,
        String bio,
        List<String> subjects,
        BigDecimal hourlyRate,
        TutorProfile.TeachingMode teachingMode,
        Integer serviceRadiusKm,
        TutorProfile.VerificationStatus verificationStatus,
        BigDecimal avgRating,
        Integer reviewCount
) {
    public static TutorProfileResponse from(TutorProfile profile) {
        return new TutorProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getDisplayName(),
                profile.getBio(),
                profile.getSubjects(),
                profile.getHourlyRate(),
                profile.getTeachingMode(),
                profile.getServiceRadiusKm(),
                profile.getVerificationStatus(),
                profile.getAvgRating(),
                profile.getReviewCount()
        );
    }
}
