package com.hometuitions.backend.leads.repository;

import com.hometuitions.backend.leads.entity.TutorApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TutorApplicationRepository extends JpaRepository<TutorApplication, UUID> {
    Page<TutorApplication> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
