package com.hometuitions.backend.user.repository;

import com.hometuitions.backend.user.entity.ParentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ParentProfileRepository extends JpaRepository<ParentProfile, UUID> {
    Optional<ParentProfile> findByUserId(UUID userId);
}
