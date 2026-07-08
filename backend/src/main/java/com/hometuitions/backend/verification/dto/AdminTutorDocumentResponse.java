package com.hometuitions.backend.verification.dto;

import com.hometuitions.backend.verification.entity.TutorDocument;

import java.time.Instant;
import java.util.UUID;

/** Unlike TutorDocumentResponse (tutor-facing), this includes tutorId and a presigned
 *  download URL - only ever returned from admin-only endpoints. */
public record AdminTutorDocumentResponse(
        UUID id,
        UUID tutorId,
        TutorDocument.DocType docType,
        TutorDocument.Status status,
        String downloadUrl,
        Instant submittedAt
) {
}
