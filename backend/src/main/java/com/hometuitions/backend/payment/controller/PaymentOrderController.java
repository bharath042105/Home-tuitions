package com.hometuitions.backend.payment.controller;

import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.payment.dto.PaymentOrderResponse;
import com.hometuitions.backend.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Lives in the payment module even though the URL reads like it belongs to bookings -
 * same cross-module-URL-namespace pattern as verification's
 * /api/v1/tutors/me/documents (Phase 5). Lets the payer's client (re)fetch order
 * details to open Razorpay Checkout, without creating a second order.
 */
@RestController
@RequestMapping("/api/v1/bookings/{bookingId}/payment-order")
@Tag(name = "Payments")
public class PaymentOrderController {

    private final PaymentService paymentService;
    private final BookingService bookingService;

    public PaymentOrderController(PaymentService paymentService, BookingService bookingService) {
        this.paymentService = paymentService;
        this.bookingService = bookingService;
    }

    @GetMapping
    public PaymentOrderResponse getOrder(Authentication authentication, @PathVariable UUID bookingId) {
        UUID userId = UUID.fromString(authentication.getName());
        if (!bookingService.isParticipant(bookingId, userId)) {
            // Reuses the exact same student/parent/tutor ownership check BookingService.cancel()
            // enforces - order amount/id shouldn't be readable by guessing a bookingId.
            throw new AccessDeniedException("This booking does not belong to you");
        }
        return paymentService.getOrder(bookingId);
    }
}
