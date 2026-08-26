package com.hometuitions.backend.leads.repository;

import com.hometuitions.backend.leads.entity.TuitionInquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TuitionInquiryRepository extends JpaRepository<TuitionInquiry, UUID> {
    Page<TuitionInquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
