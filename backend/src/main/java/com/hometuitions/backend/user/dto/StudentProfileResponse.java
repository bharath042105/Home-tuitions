package com.hometuitions.backend.user.dto;

import com.hometuitions.backend.user.entity.StudentProfile;

import java.util.UUID;

public record StudentProfileResponse(
        UUID id,
        UUID userId,
        String displayName,
        String grade,
        String subjectsOfInterest,
        String city
) {
    public static StudentProfileResponse from(StudentProfile profile) {
        return new StudentProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getDisplayName(),
                profile.getGrade(),
                profile.getSubjectsOfInterest(),
                profile.getCity());
    }
}
