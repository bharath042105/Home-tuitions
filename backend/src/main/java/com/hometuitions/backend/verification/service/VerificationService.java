package com.hometuitions.backend.verification.service;

import com.hometuitions.backend.verification.dto.UploadUrlRequest;
import com.hometuitions.backend.verification.dto.UploadUrlResponse;
import com.hometuitions.backend.verification.entity.TutorDocument;

import java.util.List;
import java.util.UUID;

public interface VerificationService {

    /** tutorId here is the TutorProfile id, not the User id. */
    UploadUrlResponse createUploadUrl(UUID tutorId, UploadUrlRequest request);

    TutorDocument submitDocument(UUID tutorId, TutorDocument.DocType docType, String s3Key);

    List<TutorDocument> listForTutor(UUID tutorId);

    /** Admin-facing (SRS FR-11.1). */
    List<TutorDocument> listPending();

    /** Approving completes the tutor's verification once both an ID_PROOF and a
     *  QUALIFICATION document are APPROVED (not on the first approval alone) - the
     *  completeness check flagged as deferred back in Phase 5. Rejecting immediately
     *  sends the whole profile back to REJECTED, regardless of any other document's
     *  status, since a single rejected document means resubmission is needed. */
    TutorDocument decide(UUID documentId, UUID adminUserId, boolean approve, String rejectReason);
}
