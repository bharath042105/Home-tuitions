package com.hometuitions.backend.support.service.impl;

import com.hometuitions.backend.support.entity.SupportTicket;
import com.hometuitions.backend.support.entity.TicketMessage;
import com.hometuitions.backend.support.repository.SupportTicketRepository;
import com.hometuitions.backend.support.repository.TicketMessageRepository;
import com.hometuitions.backend.support.service.SupportService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class SupportServiceImpl implements SupportService {

    private final SupportTicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;

    public SupportServiceImpl(SupportTicketRepository ticketRepository, TicketMessageRepository messageRepository) {
        this.ticketRepository = ticketRepository;
        this.messageRepository = messageRepository;
    }

    @Override
    public SupportTicket raiseTicket(UUID userId, String subject, String firstMessage) {
        SupportTicket ticket = new SupportTicket();
        ticket.setRaisedBy(userId);
        ticket.setSubject(subject);
        SupportTicket saved = ticketRepository.save(ticket);

        TicketMessage message = new TicketMessage();
        message.setTicketId(saved.getId());
        message.setSenderId(userId);
        message.setBody(firstMessage);
        messageRepository.save(message);

        return saved;
    }

    @Override
    public List<SupportTicket> listOwn(UUID userId) {
        return ticketRepository.findByRaisedByOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<TicketMessage> listMessages(UUID ticketId, UUID callerUserId, boolean isAdmin) {
        SupportTicket ticket = getOrThrow(ticketId);
        if (!isAdmin && !ticket.getRaisedBy().equals(callerUserId)) {
            throw new AccessDeniedException("This ticket does not belong to you");
        }
        return messageRepository.findByTicketIdOrderBySentAtAsc(ticketId);
    }

    @Override
    public TicketMessage addMessage(UUID ticketId, UUID senderId, String body, boolean isAdmin) {
        SupportTicket ticket = getOrThrow(ticketId);
        if (!isAdmin && !ticket.getRaisedBy().equals(senderId)) {
            throw new AccessDeniedException("This ticket does not belong to you");
        }

        TicketMessage message = new TicketMessage();
        message.setTicketId(ticketId);
        message.setSenderId(senderId);
        message.setBody(body);
        TicketMessage saved = messageRepository.save(message);

        // An admin replying moves an OPEN ticket into IN_PROGRESS automatically - this
        // is the one status nudge that doesn't need an explicit admin action, since
        // "someone is now working on it" is exactly what a reply means.
        if (isAdmin && ticket.getStatus() == SupportTicket.Status.OPEN) {
            ticket.setStatus(SupportTicket.Status.IN_PROGRESS);
            ticketRepository.save(ticket);
        }

        return saved;
    }

    @Override
    public List<SupportTicket> listAll(SupportTicket.Status statusFilter) {
        return statusFilter != null
                ? ticketRepository.findByStatusOrderByCreatedAtDesc(statusFilter)
                : ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public SupportTicket updateStatus(UUID ticketId, SupportTicket.Status status) {
        SupportTicket ticket = getOrThrow(ticketId);
        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }

    private SupportTicket getOrThrow(UUID ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found"));
    }
}
