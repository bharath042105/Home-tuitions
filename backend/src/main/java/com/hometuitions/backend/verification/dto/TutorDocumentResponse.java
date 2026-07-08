package com.hometuitions.backend.verification.dto;

import com.hometuitions.backend.verification.entity.TutorDocument;

import java.time.Instant;
import java.util.UUID;

public record TutorDocumentResponse(
        UUID id,
        TutorDocument.DocType docType,
        TutorDocument.Status status,
        String rejectReason,
        Instant submittedAt
) {
    public static TutorDocumentResponse from(TutorDocument doc) {
        // Deliberately excludes s3Key - documents are private (SRS  3 data
        // classification), the only way to view one is the reviewer download-URL
        // endpoint, never a raw key handed back to the tutor themselves.
        return new TutorDocumentResponse(
                doc.getId(), doc.getDocType(), doc.getStatus(), doc.getRejectReason(), doc.getSubmittedAt());
    }
}
