package com.hometuitions.backend.verification.dto;

import com.hometuitions.backend.verification.entity.TutorDocument;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmitDocumentRequest(
        @NotNull TutorDocument.DocType docType,
        @NotBlank String s3Key
) {
}
