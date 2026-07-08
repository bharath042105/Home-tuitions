package com.hometuitions.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpRequestRequest(
        @NotBlank @Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "Phone must be in E.164 format") String phone
) {
}
