package com.hometuitions.backend.booking.repository;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<Booking> findByStudentIdInOrderByCreatedAtDesc(List<UUID> studentIds);
    List<Booking> findByTutorIdOrderByCreatedAtDesc(UUID tutorId);
    List<Booking> findByStatusAndLastTransitionAtBefore(BookingStatus status, Instant cutoff);
    List<Booking> findByStatusAndPaymentDeadlineBefore(BookingStatus status, Instant cutoff);
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
    List<Booking> findAllByOrderByCreatedAtDesc();

    /** time_range isn't a derived-query-friendly field (it's a Postgres range type, not a
     *  plain column Spring Data can generate "upper(...)" for) - a native query is the
     *  simplest correct way to filter on its upper bound. Used by the Phase 12 attendance
     *  auto-confirm job (SRS FR-6: 48h after session end with only one side recorded). */
    @Query(value = "SELECT * FROM bookings WHERE status = 'CONFIRMED' AND mode = 'OFFLINE' " +
            "AND upper(time_range) < :cutoff", nativeQuery = true)
    List<Booking> findConfirmedOfflinePastCutoff(Instant cutoff);
}
