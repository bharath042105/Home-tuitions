package com.hometuitions.backend.verification.service.impl;

import com.hometuitions.backend.common.audit.AuditLogService;
import com.hometuitions.backend.common.storage.StorageService;
import com.hometuitions.backend.user.entity.TutorProfile;
import com.hometuitions.backend.user.service.TutorProfileService;
import com.hometuitions.backend.verification.dto.UploadUrlRequest;
import com.hometuitions.backend.verification.dto.UploadUrlResponse;
import com.hometuitions.backend.verification.entity.TutorDocument;
import com.hometuitions.backend.verification.repository.TutorDocumentRepository;
import com.hometuitions.backend.verification.service.VerificationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class VerificationServiceImpl implements VerificationService {

    private static final Duration UPLOAD_URL_TTL = Duration.ofMinutes(10);

    private final TutorDocumentRepository documentRepository;
    private final StorageService storageService;
    private final TutorProfileService tutorProfileService;
    private final AuditLogService auditLogService;

    public VerificationServiceImpl(TutorDocumentRepository documentRepository,
                                    StorageService storageService,
                                    TutorProfileService tutorProfileService,
                                    AuditLogService auditLogService) {
        this.documentRepository = documentRepository;
        this.storageService = storageService;
        this.tutorProfileService = tutorProfileService;
        this.auditLogService = auditLogService;
    }

    @Override
    public UploadUrlResponse createUploadUrl(UUID tutorId, UploadUrlRequest request) {
        String key = storageService.buildKey("tutor-documents", tutorId.toString(), request.filename());
        var url = storageService.generateUploadUrl(key, request.contentType(), UPLOAD_URL_TTL);
        return new UploadUrlResponse(url.toString(), key);
    }

    @Override
    public TutorDocument submitDocument(UUID tutorId, TutorDocument.DocType docType, String s3Key) {
        TutorDocument document = new TutorDocument();
        document.setTutorId(tutorId);
        document.setDocType(docType);
        document.setS3Key(s3Key);
        TutorDocument saved = documentRepository.save(document);

        // Any document submission puts the profile back into the review queue -
        // admin sees SUBMITTED as soon as the first document lands, not only once
        // both ID_PROOF and QUALIFICATION are present (that completeness check is
        // the admin reviewer's job, not a gate on this endpoint).
        tutorProfileService.markSubmittedForVerification(tutorId);

        return saved;
    }

    @Override
    public List<TutorDocument> listForTutor(UUID tutorId) {
        return documentRepository.findByTutorId(tutorId);
    }

    @Override
    public List<TutorDocument> listPending() {
        return documentRepository.findByStatus(TutorDocument.Status.PENDING);
    }

    @Override
    public TutorDocument decide(UUID documentId, UUID adminUserId, boolean approve, String rejectReason) {
        TutorDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));

        document.setStatus(approve ? TutorDocument.Status.APPROVED : TutorDocument.Status.REJECTED);
        document.setReviewedBy(adminUserId);
        document.setRejectReason(approve ? null : rejectReason);
        document.setReviewedAt(Instant.now());
        TutorDocument saved = documentRepository.save(document);

        if (approve) {
            boolean hasApprovedId = documentRepository.existsByTutorIdAndDocTypeAndStatus(
                    saved.getTutorId(), TutorDocument.DocType.ID_PROOF, TutorDocument.Status.APPROVED);
            boolean hasApprovedQualification = documentRepository.existsByTutorIdAndDocTypeAndStatus(
                    saved.getTutorId(), TutorDocument.DocType.QUALIFICATION, TutorDocument.Status.APPROVED);
            if (hasApprovedId && hasApprovedQualification) {
                tutorProfileService.applyVerificationDecision(saved.getTutorId(), TutorProfile.VerificationStatus.VERIFIED);
            }
        } else {
            tutorProfileService.applyVerificationDecision(saved.getTutorId(), TutorProfile.VerificationStatus.REJECTED);
        }

        auditLogService.record(adminUserId.toString(), "TUTOR_DOCUMENT_DECIDED", documentId.toString(),
                Map.of("approved", approve));
        return saved;
    }
}
