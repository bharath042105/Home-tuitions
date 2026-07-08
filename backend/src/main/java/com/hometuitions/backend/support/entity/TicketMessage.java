package com.hometuitions.backend.support.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ticket_messages")
@Getter
@Setter
@NoArgsConstructor
public class TicketMessage {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "ticket_id", nullable = false)
    private UUID ticketId;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "sent_at", updatable = false)
    private Instant sentAt = Instant.now();
}
