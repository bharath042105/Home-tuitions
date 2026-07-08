package com.hometuitions.backend.notification.service.impl;

import com.hometuitions.backend.booking.entity.Booking;
import com.hometuitions.backend.booking.event.BookingAcceptedEvent;
import com.hometuitions.backend.booking.event.BookingCancelledEvent;
import com.hometuitions.backend.booking.event.BookingRejectedEvent;
import com.hometuitions.backend.booking.event.BookingRequestedEvent;
import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.notification.service.NotificationService;
import com.hometuitions.backend.user.service.ParentProfileService;
import com.hometuitions.backend.user.service.StudentProfileService;
import com.hometuitions.backend.user.service.TutorProfileService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

/**
 * Reacts to booking-domain events the same way BookingPaymentEventListener (Phase 9)
 * reacts to them for payments - notification stays decoupled from booking at compile
 * time, and this is also what finally wires up the "TODO: dispatch notification" gaps
 * flagged since Phase 4/5/8.
 */
@Component
public class BookingNotificationEventListener {

    private final NotificationService notificationService;
    private final BookingService bookingService;
    private final TutorProfileService tutorProfileService;
    private final StudentProfileService studentProfileService;
    private final ParentProfileService parentProfileService;

    public BookingNotificationEventListener(NotificationService notificationService,
                                             BookingService bookingService,
                                             TutorProfileService tutorProfileService,
                                             StudentProfileService studentProfileService,
                                             ParentProfileService parentProfileService) {
        this.notificationService = notificationService;
        this.bookingService = bookingService;
        this.tutorProfileService = tutorProfileService;
        this.studentProfileService = studentProfileService;
        this.parentProfileService = parentProfileService;
    }

    @EventListener
    public void onBookingRequested(BookingRequestedEvent event) {
        UUID tutorUserId = tutorProfileService.getById(event.tutorProfileId()).getUserId();
        notificationService.notify(tutorUserId, "BOOKING_REQUESTED",
                "New booking request", "A student has requested a session with you.",
                Map.of("bookingId", event.bookingId().toString()));
    }

    @EventListener
    public void onBookingAccepted(BookingAcceptedEvent event) {
        notifyPayer(event.bookingId(), "BOOKING_ACCEPTED", "Booking accepted",
                "Your tutor accepted - complete payment to confirm your session.");
    }

    @EventListener
    public void onBookingRejected(BookingRejectedEvent event) {
        notifyPayer(event.bookingId(), "BOOKING_REJECTED", "Booking declined",
                "Your tutor was unable to accept this booking request.");
    }

    @EventListener
    public void onBookingCancelled(BookingCancelledEvent event) {
        Booking booking = bookingService.getById(event.bookingId());
        UUID tutorUserId = tutorProfileService.getById(event.tutorProfileId()).getUserId();
        notificationService.notify(tutorUserId, "BOOKING_CANCELLED", "Booking cancelled",
                "A booking was cancelled.", Map.of("bookingId", event.bookingId().toString()));
        notifyPayer(booking.getId(), "BOOKING_CANCELLED", "Booking cancelled",
                "Your booking was cancelled.");
    }

    private void notifyPayer(UUID bookingId, String type, String title, String body) {
        Booking booking = bookingService.getById(bookingId);
        UUID payerUserId = booking.getParentId() != null
                ? parentProfileService.getById(booking.getParentId()).getUserId()
                : studentProfileService.getById(booking.getStudentId()).getUserId();
        notificationService.notify(payerUserId, type, title, body, Map.of("bookingId", bookingId.toString()));
    }
}
