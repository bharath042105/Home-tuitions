package com.hometuitions.backend.chat.repository;

import com.hometuitions.backend.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByThreadIdOrderBySentAtAsc(UUID threadId);
}
