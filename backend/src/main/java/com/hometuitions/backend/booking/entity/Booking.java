package com.hometuitions.backend.booking.entity;

import io.hypersistence.utils.hibernate.type.range.Range;
import io.hypersistence.utils.hibernate.type.range.PostgreSQLRangeType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
public class Booking {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId; // StudentProfile.id

    @Column(name = "parent_id")
    private UUID parentId; // ParentProfile.id, null if the student booked directly

    @Column(name = "tutor_id", nullable = false)
    private UUID tutorId; // TutorProfile.id

    @Column(nullable = false, length = 100)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Mode mode;

    @Type(PostgreSQLRangeType.class)
    @Column(name = "time_range", columnDefinition = "tstzrange", nullable = false)
    private Range<OffsetDateTime> timeRange;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BookingStatus status = BookingStatus.PENDING_TUTOR_ACTION;

    @Column(name = "payment_deadline")
    private Instant paymentDeadline;

    @Column(name = "last_transition_at", nullable = false)
    private Instant lastTransitionAt = Instant.now();

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public enum Mode { ONLINE, OFFLINE }

    public OffsetDateTime startTime() {
        return timeRange.lower();
    }

    public OffsetDateTime endTime() {
        return timeRange.upper();
    }
}
