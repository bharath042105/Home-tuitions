package com.hometuitions.backend.classroom.repository;

import com.hometuitions.backend.classroom.entity.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    Optional<Dispute> findByBookingId(UUID bookingId);
    List<Dispute> findByStatus(Dispute.Status status);
}
