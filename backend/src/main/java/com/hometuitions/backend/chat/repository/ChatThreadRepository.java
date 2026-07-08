package com.hometuitions.backend.chat.repository;

import com.hometuitions.backend.chat.entity.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChatThreadRepository extends JpaRepository<ChatThread, UUID> {
    Optional<ChatThread> findByBookingId(UUID bookingId);
}
