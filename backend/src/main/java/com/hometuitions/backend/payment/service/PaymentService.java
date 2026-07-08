package com.hometuitions.backend.payment.service;

import com.hometuitions.backend.payment.dto.PaymentOrderResponse;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentService {

    /** Called by the booking module when a tutor accepts a request. */
    PaymentOrderResponse createOrder(UUID bookingId, UUID tutorId, BigDecimal amount);

    /** Lets the payer re-fetch order details (e.g. after a page reload) without
     *  creating a second Razorpay order for the same booking. */
    PaymentOrderResponse getOrder(UUID bookingId);

    /** Verifies the HMAC signature before touching anything - throws
     *  InvalidWebhookSignatureException on mismatch. Idempotent per razorpay_event_id. */
    void handleWebhookEvent(String rawPayload, String signatureHeader);

    /** Called by the booking module on cancellation. A no-op (not an error) if no
     *  payment was ever captured for this booking - most cancellations happen before
     *  payment, and refunding "nothing" isn't a failure case. */
    void refund(UUID bookingId, UUID tutorId);

    /** Called once a session is marked complete (Phase 12 offline attendance dual-confirm;
     *  Phase 11 online will call this too once it exists). Commission is taken here, per
     *  docs/phase2/03-low-level-design.md  2. Derives the payable amount from the stored
     *  Payment row rather than taking it as a parameter - the caller shouldn't need to
     *  already know what was actually captured just to release it. A no-op if no CAPTURED
     *  payment exists for this booking (e.g. an OFFLINE-only concept never applies to a
     *  booking that somehow completed without payment - shouldn't happen, but release()
     *  must not fabricate a ledger entry for money that was never held). */
    void release(UUID bookingId, UUID tutorId);

    /** Admin-facing (SRS FR-11.4). */
    BigDecimal totalRevenueReleased();
}
