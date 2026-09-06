package com.hometuitions.backend.leads.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SubmitContactMessageRequest(
        @NotBlank(message = "Name is required") @Size(max = 150) String name,
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9")
        String phone,
        @Email(message = "Please enter a valid email address") @Size(max = 200) String email,
        @NotBlank(message = "Message is required") @Size(max = 5000) String message
) {
}
