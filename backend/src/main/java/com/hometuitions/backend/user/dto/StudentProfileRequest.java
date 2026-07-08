package com.hometuitions.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StudentProfileRequest(
        @NotBlank @Size(max = 150) String displayName,
        @Size(max = 50) String grade,
        @Size(max = 1000) String subjectsOfInterest,
        @Size(max = 100) String city
) {
}
