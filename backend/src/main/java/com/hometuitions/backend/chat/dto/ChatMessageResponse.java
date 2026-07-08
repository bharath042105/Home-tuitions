package com.hometuitions.backend.chat.dto;

import com.hometuitions.backend.chat.entity.ChatMessage;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageResponse(UUID id, UUID senderId, String body, Instant sentAt) {
    public static ChatMessageResponse from(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(), message.getSenderId(),
                message.isDeleted() ? "[message deleted]" : message.getBody(),
                message.getSentAt());
    }
}
