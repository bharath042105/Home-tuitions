package com.hometuitions.backend.payment.service.impl;

import com.hometuitions.backend.booking.event.BookingAcceptedEvent;
import com.hometuitions.backend.booking.event.BookingCancelledEvent;
import com.hometuitions.backend.booking.event.SessionCompletedEvent;
import com.hometuitions.backend.payment.service.PaymentService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Reacts to booking-domain events instead of BookingService calling PaymentService
 * directly - see BookingAcceptedEvent's javadoc for why (avoids a circular Spring bean
 * dependency, since PaymentServiceImpl already depends on BookingService for confirmPayment()).
 */
@Component
public class BookingPaymentEventListener {

    private final PaymentService paymentService;

    public BookingPaymentEventListener(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @EventListener
    public void onBookingAccepted(BookingAcceptedEvent event) {
        paymentService.createOrder(event.bookingId(), event.tutorProfileId(), event.amount());
    }

    @EventListener
    public void onBookingCancelled(BookingCancelledEvent event) {
        paymentService.refund(event.bookingId(), event.tutorProfileId());
    }

    @EventListener
    public void onSessionCompleted(SessionCompletedEvent event) {
        paymentService.release(event.bookingId(), event.tutorProfileId());
    }
}
