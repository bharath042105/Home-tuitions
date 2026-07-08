package com.hometuitions.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ParentProfileRequest(
        @NotBlank @Size(max = 150) String displayName
) {
}
