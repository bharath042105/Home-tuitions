package com.hometuitions.backend.verification.service;

import com.hometuitions.backend.common.audit.AuditLogService;
import com.hometuitions.backend.common.storage.StorageService;
import com.hometuitions.backend.user.entity.TutorProfile;
import com.hometuitions.backend.user.service.TutorProfileService;
import com.hometuitions.backend.verification.entity.TutorDocument;
import com.hometuitions.backend.verification.repository.TutorDocumentRepository;
import com.hometuitions.backend.verification.service.impl.VerificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * The completeness check (both ID_PROOF and QUALIFICATION individually APPROVED before
 * a tutor becomes VERIFIED, per docs/phase14/README.md) is the one rule in this class
 * worth a real test - getting it wrong either lets an under-verified tutor onto the
 * marketplace or blocks a fully-verified one.
 */
class VerificationServiceImplTest {

    private TutorDocumentRepository documentRepository;
    private TutorProfileService tutorProfileService;
    private VerificationServiceImpl verificationService;

    private final UUID documentId = UUID.randomUUID();
    private final UUID tutorId = UUID.randomUUID();
    private final UUID adminUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        documentRepository = mock(TutorDocumentRepository.class);
        tutorProfileService = mock(TutorProfileService.class);
        StorageService storageService = mock(StorageService.class);
        AuditLogService auditLogService = mock(AuditLogService.class);

        verificationService = new VerificationServiceImpl(
                documentRepository, storageService, tutorProfileService, auditLogService);
    }

    private TutorDocument documentOfType(TutorDocument.DocType type) {
        TutorDocument document = new TutorDocument();
        document.setId(documentId);
        document.setTutorId(tutorId);
        document.setDocType(type);
        document.setStatus(TutorDocument.Status.PENDING);
        return document;
    }

    @Test
    void approvingOneDocumentType_doesNotVerifyTutorUntilTheOtherTypeIsAlsoApproved() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(documentOfType(TutorDocument.DocType.ID_PROOF)));
        when(documentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(documentRepository.existsByTutorIdAndDocTypeAndStatus(
                tutorId, TutorDocument.DocType.ID_PROOF, TutorDocument.Status.APPROVED)).thenReturn(true);
        when(documentRepository.existsByTutorIdAndDocTypeAndStatus(
                tutorId, TutorDocument.DocType.QUALIFICATION, TutorDocument.Status.APPROVED)).thenReturn(false);

        verificationService.decide(documentId, adminUserId, true, null);

        verify(tutorProfileService, never()).applyVerificationDecision(any(), any());
    }

    @Test
    void approvingBothDocumentTypes_verifiesTheTutor() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(documentOfType(TutorDocument.DocType.QUALIFICATION)));
        when(documentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(documentRepository.existsByTutorIdAndDocTypeAndStatus(
                tutorId, TutorDocument.DocType.ID_PROOF, TutorDocument.Status.APPROVED)).thenReturn(true);
        when(documentRepository.existsByTutorIdAndDocTypeAndStatus(
                tutorId, TutorDocument.DocType.QUALIFICATION, TutorDocument.Status.APPROVED)).thenReturn(true);

        verificationService.decide(documentId, adminUserId, true, null);

        verify(tutorProfileService).applyVerificationDecision(tutorId, TutorProfile.VerificationStatus.VERIFIED);
    }

    @Test
    void rejectingAnyDocument_rejectsTheWholeProfileRegardlessOfOtherDocuments() {
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(documentOfType(TutorDocument.DocType.ID_PROOF)));
        when(documentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        verificationService.decide(documentId, adminUserId, false, "blurry photo");

        verify(tutorProfileService).applyVerificationDecision(tutorId, TutorProfile.VerificationStatus.REJECTED);
        // A rejection must never also trigger the completeness check's VERIFIED path.
        verify(documentRepository, never()).existsByTutorIdAndDocTypeAndStatus(any(), any(), any());
    }
}
