package com.hometuitions.backend.leads.dto;

import com.hometuitions.backend.leads.entity.LeadStatus;
import com.hometuitions.backend.leads.entity.TuitionInquiry;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TuitionInquiryResponse(
        UUID id,
        String grade,
        String board,
        List<String> subjects,
        String tuitionMode,
        String address,
        String timings,
        String frequency,
        String parentName,
        String mobile,
        String email,
        String budget,
        String remarks,
        LeadStatus status,
        Instant createdAt
) {
    public static TuitionInquiryResponse from(TuitionInquiry inquiry) {
        return new TuitionInquiryResponse(
                inquiry.getId(),
                inquiry.getGrade(),
                inquiry.getBoard(),
                List.of(inquiry.getSubjects().split(",")),
                inquiry.getTuitionMode(),
                inquiry.getAddress(),
                inquiry.getTimings(),
                inquiry.getFrequency(),
                inquiry.getParentName(),
                inquiry.getMobile(),
                inquiry.getEmail(),
                inquiry.getBudget(),
                inquiry.getRemarks(),
                inquiry.getStatus(),
                inquiry.getCreatedAt());
    }
}
