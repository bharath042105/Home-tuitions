package com.hometuitions.backend.verification.repository;

import com.hometuitions.backend.verification.entity.TutorDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TutorDocumentRepository extends JpaRepository<TutorDocument, UUID> {
    List<TutorDocument> findByTutorId(UUID tutorId);
    List<TutorDocument> findByStatus(TutorDocument.Status status);
    boolean existsByTutorIdAndDocTypeAndStatus(UUID tutorId, TutorDocument.DocType docType, TutorDocument.Status status);
}
