package com.hometuitions.backend.support.service;

import com.hometuitions.backend.support.entity.SupportTicket;
import com.hometuitions.backend.support.entity.TicketMessage;

import java.util.List;
import java.util.UUID;

public interface SupportService {

    SupportTicket raiseTicket(UUID userId, String subject, String firstMessage);

    List<SupportTicket> listOwn(UUID userId);

    /** Every method that touches an existing ticket verifies the caller either raised
     *  it or is calling through an admin-only endpoint (isAdmin) - a ticket's contents
     *  are private between the raiser and support staff. */
    List<TicketMessage> listMessages(UUID ticketId, UUID callerUserId, boolean isAdmin);

    TicketMessage addMessage(UUID ticketId, UUID senderId, String body, boolean isAdmin);

    List<SupportTicket> listAll(SupportTicket.Status statusFilter);

    SupportTicket updateStatus(UUID ticketId, SupportTicket.Status status);
}
