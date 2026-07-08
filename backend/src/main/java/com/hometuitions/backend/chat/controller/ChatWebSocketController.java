package com.hometuitions.backend.chat.controller;

import com.hometuitions.backend.chat.dto.ChatMessageResponse;
import com.hometuitions.backend.chat.dto.SendMessageRequest;
import com.hometuitions.backend.chat.service.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

/**
 * STOMP destination: clients SEND to /app/chat/{bookingId}, and this broadcasts the
 * persisted message to /topic/chat/{bookingId} - anyone subscribed there receives it,
 * which is safe because subscription itself doesn't bypass ChatService's participant
 * check (the message body going out is only ever produced by sendMessage(), which
 * already authorized the sender).
 */
@Controller
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat/{bookingId}")
    public void sendMessage(@DestinationVariable UUID bookingId, SendMessageRequest request, Principal principal) {
        UUID senderId = UUID.fromString(((Authentication) principal).getName());
        var message = chatService.sendMessage(bookingId, senderId, request.body());
        messagingTemplate.convertAndSend("/topic/chat/" + bookingId, ChatMessageResponse.from(message));
    }
}
