package com.hometuitions.backend.leads.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SubmitTutorApplicationRequest(
        @NotBlank(message = "Tutor name is required") @Size(max = 150) String name,
        @Size(max = 150) String fatherName,
        @NotBlank(message = "Qualification is required") @Size(max = 150) String qualification,
        @NotBlank(message = "College / University is required") @Size(max = 200) String college,
        @NotBlank(message = "Graduation percentage is required") @Size(max = 10) String percentage,
        @NotBlank(message = "Passing year is required") @Pattern(regexp = "^\\d{4}$", message = "Passing year must be a 4-digit year") String passYear,
        @Size(max = 200) String interCollege,
        @Size(max = 10) String interPercentage,
        @Size(max = 200) String schoolName,
        @Size(max = 10) String schoolPercentage,
        @NotBlank(message = "Preferred tutoring localities are required") @Size(max = 2000) String localities,
        @Size(max = 50) String commuteDistance,
        @NotEmpty(message = "At least one grade/class must be selected") List<@NotBlank String> grades,
        @NotEmpty(message = "At least one subject must be selected") List<@NotBlank String> subjects,
        @NotEmpty(message = "At least one education board must be selected") List<@NotBlank String> boards,
        @Size(max = 50) String medium,
        @NotBlank(message = "Tutoring mode is required") @Size(max = 20) String mode,
        @NotBlank(message = "Mobile number is required") @Pattern(regexp = "^[6-9]\\d{9}$", message = "Mobile number must be a valid 10-digit Indian number starting with 6-9") String mobile,
        @NotBlank(message = "WhatsApp number is required") @Pattern(regexp = "^[6-9]\\d{9}$", message = "WhatsApp number must be a valid 10-digit Indian number starting with 6-9") String whatsapp,
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Alternative phone must be a valid 10-digit Indian number starting with 6-9") String alternativePhone,
        @NotBlank(message = "Email address is required") @Email(message = "Please enter a valid email address") @Size(max = 200) String email,
        @Size(max = 50) String occupation,
        @Size(max = 50) String experience,
        @NotBlank(message = "Expected rate is required") @Size(max = 50) String expectedRate,
        @Size(max = 100) String timings,
        @Size(max = 5000) String bio,
        @Size(max = 2000) String photoUrl,
        @Size(max = 2000) String aadhaarUrl,
        @Size(max = 2000) String degreeUrl,
        @Size(max = 2000) String resumeUrl
) {
}
