package com.hometuitions.backend.support.repository;

import com.hometuitions.backend.support.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketMessageRepository extends JpaRepository<TicketMessage, UUID> {
    List<TicketMessage> findByTicketIdOrderBySentAtAsc(UUID ticketId);
}
