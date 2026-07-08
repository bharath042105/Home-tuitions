package com.hometuitions.backend.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tutor_profiles")
@Getter
@Setter
@NoArgsConstructor
public class TutorProfile {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "display_name", nullable = false, length = 150)
    private String displayName;

    @Column(columnDefinition = "text")
    private String bio;

    // Hibernate 6 native array support maps this straight onto Postgres text[] -
    // subjects have no independent identity/attributes, so a join table would be overkill.
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private java.util.List<String> subjects = new java.util.ArrayList<>();

    @Column(name = "hourly_rate", nullable = false)
    private BigDecimal hourlyRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "teaching_mode", nullable = false, length = 10)
    private TeachingMode teachingMode;

    @Column(name = "service_radius_km")
    private Integer serviceRadiusKm = 10;

    // base_location (PostGIS geography) intentionally unmapped until Phase 6 - Student
    // module needs geo search; hibernate-spatial wiring lands with that phase instead of
    // being half-used here with no query to exercise it.

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 20)
    private VerificationStatus verificationStatus = VerificationStatus.NOT_SUBMITTED;

    @Column(name = "avg_rating")
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public enum TeachingMode { ONLINE, OFFLINE, BOTH }

    public enum VerificationStatus { NOT_SUBMITTED, SUBMITTED, VERIFIED, REJECTED }
}
