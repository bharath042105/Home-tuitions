package com.hometuitions.backend.booking.service.impl;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.entity.BookingStatus;
import com.hometuitions.backend.booking.repository.BookingRepository;
import com.hometuitions.backend.booking.service.BookingStateMachine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * SRS FR-4.2 (tutor response window, default 24h) and FR-4.3 (30 min to pay once
 * accepted) - both expire to BookingStatus.EXPIRED. Runs every 5 minutes; "actor" for
 * the audit trail is "system" since no human triggered these transitions.
 */
@Component
public class BookingExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(BookingExpiryJob.class);
    private static final Duration TUTOR_RESPONSE_WINDOW = Duration.ofHours(24);
    private static final String SYSTEM_ACTOR = "system";

    private final BookingRepository bookingRepository;
    private final BookingStateMachine stateMachine;

    public BookingExpiryJob(BookingRepository bookingRepository, BookingStateMachine stateMachine) {
        this.bookingRepository = bookingRepository;
        this.stateMachine = stateMachine;
    }

    @Scheduled(fixedDelay = 5, timeUnit = java.util.concurrent.TimeUnit.MINUTES)
    @Transactional
    public void expireStaleBookings() {
        expireUnansweredRequests();
        expireUnpaidAcceptances();
    }

    private void expireUnansweredRequests() {
        Instant cutoff = Instant.now().minus(TUTOR_RESPONSE_WINDOW);
        List<Booking> stale = bookingRepository.findByStatusAndLastTransitionAtBefore(
                BookingStatus.PENDING_TUTOR_ACTION, cutoff);
        stale.forEach(booking -> {
            stateMachine.transition(booking, BookingStatus.EXPIRED, SYSTEM_ACTOR);
            bookingRepository.save(booking);
        });
        if (!stale.isEmpty()) {
            log.info("Expired {} unanswered booking request(s)", stale.size());
        }
    }

    private void expireUnpaidAcceptances() {
        List<Booking> stale = bookingRepository.findByStatusAndPaymentDeadlineBefore(
                BookingStatus.PENDING_PAYMENT, Instant.now());
        stale.forEach(booking -> {
            stateMachine.transition(booking, BookingStatus.EXPIRED, SYSTEM_ACTOR);
            bookingRepository.save(booking);
        });
        if (!stale.isEmpty()) {
            log.info("Expired {} unpaid accepted booking(s)", stale.size());
        }
    }
}
