package com.hometuitions.backend.payment.repository;

import com.hometuitions.backend.payment.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {
    List<LedgerEntry> findByTutorId(UUID tutorId);
    List<LedgerEntry> findByBookingId(UUID bookingId);

    /** Platform revenue proxy for the admin dashboard (SRS FR-11.4) - sum of everything
     *  actually released to tutors (commission was already deducted at release time, so
     *  this is what completed, paid-out sessions are worth from the tutor's side; total
     *  platform take would be captured-minus-released, not modeled as its own metric yet). */
    @Query("SELECT COALESCE(SUM(l.amount), 0) FROM LedgerEntry l WHERE l.type = 'RELEASE'")
    BigDecimal sumReleased();
}
