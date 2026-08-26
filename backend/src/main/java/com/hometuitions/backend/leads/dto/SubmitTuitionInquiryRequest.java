package com.hometuitions.backend.leads.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SubmitTuitionInquiryRequest(
        @NotBlank @Size(max = 50) String grade,
        @NotBlank @Size(max = 50) String board,
        @NotEmpty List<@NotBlank String> subjects,
        @NotBlank @Size(max = 20) String tuitionMode,
        @Size(max = 2000) String address,
        @NotBlank @Size(max = 100) String timings,
        @Size(max = 50) String frequency,
        @NotBlank @Size(max = 150) String parentName,
        @NotBlank @Pattern(regexp = "\\d{10}") String mobile,
        @Email @Size(max = 200) String email,
        @Size(max = 50) String budget,
        @Size(max = 5000) String remarks
) {
}
