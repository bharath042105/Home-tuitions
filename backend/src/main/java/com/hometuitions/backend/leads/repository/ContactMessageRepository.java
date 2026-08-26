package com.hometuitions.backend.leads.repository;

import com.hometuitions.backend.leads.entity.ContactMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, UUID> {
    Page<ContactMessage> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
