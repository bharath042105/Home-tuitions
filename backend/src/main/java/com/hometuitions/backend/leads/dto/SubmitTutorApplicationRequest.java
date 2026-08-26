package com.hometuitions.backend.leads.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SubmitTutorApplicationRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 150) String fatherName,
        @NotBlank @Size(max = 150) String qualification,
        @NotBlank @Size(max = 200) String college,
        @NotBlank @Size(max = 10) String percentage,
        @NotBlank @Pattern(regexp = "\\d{4}") String passYear,
        @Size(max = 200) String interCollege,
        @Size(max = 10) String interPercentage,
        @Size(max = 200) String schoolName,
        @Size(max = 10) String schoolPercentage,
        @NotBlank @Size(max = 2000) String localities,
        @Size(max = 50) String commuteDistance,
        @NotEmpty List<@NotBlank String> grades,
        @NotEmpty List<@NotBlank String> subjects,
        @NotEmpty List<@NotBlank String> boards,
        @Size(max = 50) String medium,
        @NotBlank @Size(max = 20) String mode,
        @NotBlank @Pattern(regexp = "\\d{10}") String mobile,
        @NotBlank @Pattern(regexp = "\\d{10}") String whatsapp,
        @Pattern(regexp = "\\d{10}") String alternativePhone,
        @NotBlank @Email @Size(max = 200) String email,
        @Size(max = 50) String occupation,
        @Size(max = 50) String experience,
        @NotBlank @Size(max = 50) String expectedRate,
        @Size(max = 100) String timings,
        @Size(max = 5000) String bio
) {
}
