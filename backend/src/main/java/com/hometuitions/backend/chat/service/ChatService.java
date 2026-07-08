package com.hometuitions.backend.chat.service;

import com.hometuitions.backend.chat.entity.ChatMessage;

import java.util.List;
import java.util.UUID;

public interface ChatService {

    /** Every method here authorizes callerUserId as a participant of the booking
     *  (student/parent/tutor, via BookingService.isParticipant) before doing anything -
     *  centralized here since both the REST controller and the STOMP handler need it. */

    List<ChatMessage> listMessages(UUID bookingId, UUID callerUserId);

    ChatMessage sendMessage(UUID bookingId, UUID callerUserId, String body);
}
