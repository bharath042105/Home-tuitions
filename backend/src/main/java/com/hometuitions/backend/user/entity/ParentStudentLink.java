package com.hometuitions.backend.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parent_student_links")
@Getter
@Setter
@NoArgsConstructor
public class ParentStudentLink {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "parent_id", nullable = false)
    private UUID parentId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(length = 50)
    private String relationship = "PARENT";

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}
