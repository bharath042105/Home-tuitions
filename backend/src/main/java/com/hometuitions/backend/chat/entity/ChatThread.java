package com.hometuitions.backend.chat.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_threads")
@Getter
@Setter
@NoArgsConstructor
public class ChatThread {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private UUID bookingId;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}
