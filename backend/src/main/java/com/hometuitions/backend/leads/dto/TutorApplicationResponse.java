package com.hometuitions.backend.leads.dto;

import com.hometuitions.backend.leads.entity.LeadStatus;
import com.hometuitions.backend.leads.entity.TutorApplication;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TutorApplicationResponse(
        UUID id,
        String name,
        String fatherName,
        String qualification,
        String college,
        String percentage,
        String passYear,
        String interCollege,
        String interPercentage,
        String schoolName,
        String schoolPercentage,
        String localities,
        String commuteDistance,
        List<String> grades,
        List<String> subjects,
        List<String> boards,
        String medium,
        String mode,
        String mobile,
        String whatsapp,
        String alternativePhone,
        String email,
        String occupation,
        String experience,
        String expectedRate,
        String timings,
        String bio,
        LeadStatus status,
        Instant createdAt
) {
    public static TutorApplicationResponse from(TutorApplication application) {
        return new TutorApplicationResponse(
                application.getId(),
                application.getName(),
                application.getFatherName(),
                application.getQualification(),
                application.getCollege(),
                application.getPercentage(),
                application.getPassYear(),
                application.getInterCollege(),
                application.getInterPercentage(),
                application.getSchoolName(),
                application.getSchoolPercentage(),
                application.getLocalities(),
                application.getCommuteDistance(),
                List.of(application.getGrades().split(",")),
                List.of(application.getSubjects().split(",")),
                List.of(application.getBoards().split(",")),
                application.getMedium(),
                application.getMode(),
                application.getMobile(),
                application.getWhatsapp(),
                application.getAlternativePhone(),
                application.getEmail(),
                application.getOccupation(),
                application.getExperience(),
                application.getExpectedRate(),
                application.getTimings(),
                application.getBio(),
                application.getStatus(),
                application.getCreatedAt());
    }
}
