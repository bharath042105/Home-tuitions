package com.hometuitions.backend.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
public class StudentProfile {

    @Id
    @UuidGenerator
    private UUID id;

    // Nullable (V9, Phase 7) - null means this is a parent-managed child sub-profile
    // with no login of its own (US-STU-02), not a self-registered Student account.
    @Column(name = "user_id", unique = true)
    private UUID userId;

    @Column(name = "display_name", nullable = false, length = 150)
    private String displayName;

    @Column(length = 50)
    private String grade;

    @Column(name = "subjects_of_interest", columnDefinition = "text")
    private String subjectsOfInterest;

    @Column(length = 100)
    private String city;

    // location (PostGIS geography) intentionally unmapped, same reasoning as
    // TutorProfile.baseLocation - nearby search takes explicit lat/lng per search
    // request (current location or a searched address), not the student's stored
    // home address, so nothing reads this column yet.

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}
