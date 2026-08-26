package com.hometuitions.backend.leads.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SubmitContactMessageRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Pattern(regexp = "\\d{10}") String phone,
        @Email @Size(max = 200) String email,
        @NotBlank @Size(max = 5000) String message
) {
}
