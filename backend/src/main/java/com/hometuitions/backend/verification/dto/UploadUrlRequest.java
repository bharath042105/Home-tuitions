package com.hometuitions.backend.verification.dto;

import com.hometuitions.backend.verification.entity.TutorDocument;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UploadUrlRequest(
        @NotNull TutorDocument.DocType docType,
        @NotBlank String filename,
        @NotBlank String contentType
) {
}
