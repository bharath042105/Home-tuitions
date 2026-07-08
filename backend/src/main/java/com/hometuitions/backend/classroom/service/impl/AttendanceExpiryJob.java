package com.hometuitions.backend.classroom.service.impl;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.repository.BookingRepository;
import com.hometuitions.backend.classroom.service.AttendanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * SRS FR-6: 48h after a confirmed offline session's scheduled end, auto-confirm
 * attendance (assume PRESENT) for whichever side never marked, as long as the other
 * side did. Same "system-actor, best-effort" shape as BookingExpiryJob (Phase 8).
 */
@Component
public class AttendanceExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(AttendanceExpiryJob.class);
    private static final Duration AUTO_CONFIRM_WINDOW = Duration.ofHours(48);

    private final BookingRepository bookingRepository;
    private final AttendanceService attendanceService;

    public AttendanceExpiryJob(BookingRepository bookingRepository, AttendanceService attendanceService) {
        this.bookingRepository = bookingRepository;
        this.attendanceService = attendanceService;
    }

    @Scheduled(fixedDelay = 15, timeUnit = TimeUnit.MINUTES)
    @Transactional
    public void autoConfirmStaleAttendance() {
        Instant cutoff = Instant.now().minus(AUTO_CONFIRM_WINDOW);
        List<Booking> bookings = bookingRepository.findConfirmedOfflinePastCutoff(cutoff);
        for (Booking booking : bookings) {
            try {
                attendanceService.autoConfirmMissingSide(booking.getId());
            } catch (Exception e) {
                // One booking's resolution failing must never block the rest of the batch.
                log.warn("Failed to auto-confirm attendance for booking {}: {}", booking.getId(), e.getMessage());
            }
        }
    }
}
