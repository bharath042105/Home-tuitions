package com.hometuitions.backend.chat.service.impl;

import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.chat.entity.ChatMessage;
import com.hometuitions.backend.chat.entity.ChatThread;
import com.hometuitions.backend.chat.event.ChatMessageSentEvent;
import com.hometuitions.backend.chat.repository.ChatMessageRepository;
import com.hometuitions.backend.chat.repository.ChatThreadRepository;
import com.hometuitions.backend.chat.service.ChatService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {

    private final ChatThreadRepository threadRepository;
    private final ChatMessageRepository messageRepository;
    private final BookingService bookingService;
    private final ApplicationEventPublisher eventPublisher;

    public ChatServiceImpl(ChatThreadRepository threadRepository,
                            ChatMessageRepository messageRepository,
                            BookingService bookingService,
                            ApplicationEventPublisher eventPublisher) {
        this.threadRepository = threadRepository;
        this.messageRepository = messageRepository;
        this.bookingService = bookingService;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public List<ChatMessage> listMessages(UUID bookingId, UUID callerUserId) {
        assertParticipant(bookingId, callerUserId);
        return threadRepository.findByBookingId(bookingId)
                .map(thread -> messageRepository.findByThreadIdOrderBySentAtAsc(thread.getId()))
                .orElseGet(List::of); // no thread yet = no messages yet, not an error
    }

    @Override
    public ChatMessage sendMessage(UUID bookingId, UUID callerUserId, String body) {
        assertParticipant(bookingId, callerUserId);
        ChatThread thread = getOrCreateThread(bookingId);

        ChatMessage message = new ChatMessage();
        message.setThreadId(thread.getId());
        message.setSenderId(callerUserId);
        message.setBody(body);
        ChatMessage saved = messageRepository.save(message);

        eventPublisher.publishEvent(new ChatMessageSentEvent(bookingId, callerUserId, body));
        return saved;
    }

    private ChatThread getOrCreateThread(UUID bookingId) {
        // Created lazily on first message, not eagerly at booking creation (Phase 8's
        // docs flagged this as the intended design) - most bookings never need a thread
        // if they're rejected/expired before anyone chats.
        return threadRepository.findByBookingId(bookingId).orElseGet(() -> {
            ChatThread thread = new ChatThread();
            thread.setBookingId(bookingId);
            return threadRepository.save(thread);
        });
    }

    private void assertParticipant(UUID bookingId, UUID userId) {
        if (!bookingService.isParticipant(bookingId, userId)) {
            throw new AccessDeniedException("You are not a participant of this booking's chat");
        }
    }
}
