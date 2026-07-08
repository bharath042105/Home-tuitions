package com.hometuitions.backend.user.dto;

import com.hometuitions.backend.user.entity.TutorProfile;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record TutorProfileRequest(
        @NotBlank @Size(max = 150) String displayName,
        @Size(max = 2000) String bio,
        @NotEmpty List<@NotEmpty String> subjects,
        @NotNull @DecimalMin(value = "0", inclusive = true) BigDecimal hourlyRate,
        @NotNull TutorProfile.TeachingMode teachingMode,
        @Min(1) Integer serviceRadiusKm,
        Double latitude,
        Double longitude
) {
}
