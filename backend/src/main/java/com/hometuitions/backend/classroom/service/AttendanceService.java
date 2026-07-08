package com.hometuitions.backend.classroom.service;

import com.hometuitions.backend.classroom.entity.AttendanceRecord;

import java.util.List;
import java.util.UUID;

/**
 * SRS FR-6: both tutor and student/parent must mark attendance within 24h of session
 * end; a match completes the booking (and releases payment), a mismatch raises a
 * dispute for admin review (Phase 14). Only ever applies to OFFLINE bookings - an
 * ONLINE booking's completion is Phase 11's concern (Agora session end tracking), not
 * attendance marking.
 */
public interface AttendanceService {

    AttendanceRecord markAttendance(UUID bookingId, UUID callerUserId, AttendanceRecord.Status status);

    List<AttendanceRecord> listForBooking(UUID bookingId, UUID callerUserId);

    /** SRS FR-6: 48h after session end, if exactly one side has marked attendance,
     *  auto-mark the other side PRESENT (benefit of the doubt) and reconcile as usual.
     *  Called by BookingAttendanceExpiryJob, not directly by any controller. */
    void autoConfirmMissingSide(UUID bookingId);
}
