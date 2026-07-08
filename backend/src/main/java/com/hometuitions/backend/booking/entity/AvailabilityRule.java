package com.hometuitions.backend.booking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "availability_rules")
@Getter
@Setter
@NoArgsConstructor
public class AvailabilityRule {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "tutor_id", nullable = false)
    private UUID tutorId; // TutorProfile.id

    @Column(name = "day_of_week", nullable = false)
    private int dayOfWeek; // 0=Sunday..6=Saturday, matches the DB check constraint

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
}
