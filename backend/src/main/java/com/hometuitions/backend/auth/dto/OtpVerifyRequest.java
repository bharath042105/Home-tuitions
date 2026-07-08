package com.hometuitions.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpVerifyRequest(
        @NotBlank @Pattern(regexp = "^\\+[1-9]\\d{7,14}$") String phone,
        @NotBlank @Pattern(regexp = "^\\d{6}$", message = "OTP must be 6 digits") String code
) {
}
