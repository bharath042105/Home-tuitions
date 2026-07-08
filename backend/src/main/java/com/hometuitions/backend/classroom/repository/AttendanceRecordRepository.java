package com.hometuitions.backend.classroom.repository;

import com.hometuitions.backend.classroom.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    List<AttendanceRecord> findByBookingId(UUID bookingId);
    Optional<AttendanceRecord> findByBookingIdAndMarkedBy(UUID bookingId, UUID markedBy);
}
