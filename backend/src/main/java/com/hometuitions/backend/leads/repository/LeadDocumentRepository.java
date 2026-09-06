package com.hometuitions.backend.leads.repository;

import com.hometuitions.backend.leads.entity.LeadDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LeadDocumentRepository extends JpaRepository<LeadDocument, UUID> {
}
