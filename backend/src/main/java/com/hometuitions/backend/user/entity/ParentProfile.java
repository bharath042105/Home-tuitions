package com.hometuitions.backend.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "parent_profiles")
@Getter
@Setter
@NoArgsConstructor
public class ParentProfile {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "display_name", nullable = false, length = 150)
    private String displayName;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}
