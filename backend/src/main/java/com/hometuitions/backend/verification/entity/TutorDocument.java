package com.hometuitions.backend.verification.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tutor_documents")
@Getter
@Setter
@NoArgsConstructor
public class TutorDocument {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "tutor_id", nullable = false)
    private UUID tutorId; // TutorProfile.id, not User.id

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 20)
    private DocType docType;

    @Column(name = "s3_key", nullable = false, length = 500)
    private String s3Key;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reject_reason", columnDefinition = "text")
    private String rejectReason;

    @Column(name = "submitted_at", updatable = false)
    private Instant submittedAt = Instant.now();

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    public enum DocType { ID_PROOF, QUALIFICATION }

    public enum Status { PENDING, APPROVED, REJECTED }
}
