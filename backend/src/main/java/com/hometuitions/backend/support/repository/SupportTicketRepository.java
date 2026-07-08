package com.hometuitions.backend.support.repository;

import com.hometuitions.backend.support.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID> {
    List<SupportTicket> findByRaisedByOrderByCreatedAtDesc(UUID raisedBy);
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
    List<SupportTicket> findByStatusOrderByCreatedAtDesc(SupportTicket.Status status);
}
