package com.hometuitions.backend.leads.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SubmitTuitionInquiryRequest(
        @NotBlank(message = "Grade / Class is required") @Size(max = 50) String grade,
        @NotBlank(message = "Education board is required") @Size(max = 50) String board,
        @NotEmpty(message = "At least one subject must be selected") List<@NotBlank String> subjects,
        @NotBlank(message = "Tuition mode is required") @Size(max = 20) String tuitionMode,
        @Size(max = 2000) String address,
        @NotBlank(message = "Preferred timings are required") @Size(max = 100) String timings,
        @Size(max = 50) String frequency,
        @NotBlank(message = "Parent / Student name is required") @Size(max = 150) String parentName,
        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9")
        String mobile,
        @Email(message = "Please enter a valid email address") @Size(max = 200) String email,
        @Size(max = 50) String budget,
        @Size(max = 5000) String remarks
) {
}
