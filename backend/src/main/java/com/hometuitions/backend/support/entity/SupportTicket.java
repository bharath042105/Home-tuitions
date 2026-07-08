package com.hometuitions.backend.support.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "support_tickets")
@Getter
@Setter
@NoArgsConstructor
public class SupportTicket {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "raised_by", nullable = false)
    private UUID raisedBy; // User.id

    @Column(nullable = false, length = 200)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.OPEN;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public enum Status { OPEN, IN_PROGRESS, CLOSED }
}
