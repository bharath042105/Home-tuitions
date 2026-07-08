package com.hometuitions.backend.chat.controller;

import com.hometuitions.backend.chat.dto.ChatMessageResponse;
import com.hometuitions.backend.chat.service.ChatService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings/{bookingId}/chat")
@Tag(name = "Chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/messages")
    public List<ChatMessageResponse> listMessages(Authentication authentication, @PathVariable UUID bookingId) {
        UUID userId = UUID.fromString(authentication.getName());
        return chatService.listMessages(bookingId, userId).stream()
                .map(ChatMessageResponse::from)
                .toList();
    }
}
