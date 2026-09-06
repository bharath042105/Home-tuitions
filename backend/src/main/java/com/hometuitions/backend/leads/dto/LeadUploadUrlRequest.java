package com.hometuitions.backend.leads.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LeadUploadUrlRequest(
        @NotBlank(message = "Filename is required") @Size(max = 255) String filename,
        @NotBlank(message = "Content type is required") @Size(max = 100) String contentType,
        @Size(max = 50) String documentType
) {
}
