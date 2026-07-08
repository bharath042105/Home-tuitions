package com.hometuitions.backend.chat.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "thread_id", nullable = false)
    private UUID threadId;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId; // User.id

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "sent_at", updatable = false)
    private Instant sentAt = Instant.now();

    @Column(nullable = false)
    private boolean deleted = false;
}
