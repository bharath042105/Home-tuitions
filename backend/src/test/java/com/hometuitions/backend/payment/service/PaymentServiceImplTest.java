package com.hometuitions.backend.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.payment.entity.LedgerEntry;
import com.hometuitions.backend.payment.entity.Payment;
import com.hometuitions.backend.payment.exception.InvalidWebhookSignatureException;
import com.hometuitions.backend.payment.repository.LedgerEntryRepository;
import com.hometuitions.backend.payment.repository.PaymentRepository;
import com.hometuitions.backend.payment.service.impl.PaymentServiceImpl;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Covers the two properties that matter most for money-handling code: refund/release
 * are no-ops (not errors) when there's nothing to act on, and a webhook can never apply
 * its side effects twice (docs/phase2/03-low-level-design.md  2.4's idempotency
 * guarantee). Doesn't exercise createOrder/handleCaptured's Razorpay API calls -
 * those would need mocking the third-party SDK's nested client objects, which is lower
 * value than the business-rule paths below.
 */
class PaymentServiceImplTest {

    private PaymentRepository paymentRepository;
    private LedgerEntryRepository ledgerEntryRepository;
    private BookingService bookingService;
    private RazorpayClient razorpayClient;
    private PaymentServiceImpl paymentService;

    private final UUID bookingId = UUID.randomUUID();
    private final UUID tutorId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        paymentRepository = mock(PaymentRepository.class);
        ledgerEntryRepository = mock(LedgerEntryRepository.class);
        bookingService = mock(BookingService.class);
        razorpayClient = mock(RazorpayClient.class);

        paymentService = new PaymentServiceImpl(
                paymentRepository, ledgerEntryRepository, bookingService, razorpayClient,
                new ObjectMapper(), "rzp_test_key", "webhook-secret", new BigDecimal("0.15"));
    }

    @Test
    void refund_isANoOpWhenNoPaymentWasEverCreated() {
        when(paymentRepository.findByBookingId(bookingId)).thenReturn(Optional.empty());

        paymentService.refund(bookingId, tutorId);

        verifyNoInteractions(ledgerEntryRepository);
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void refund_isANoOpWhenPaymentWasNeverCaptured() {
        Payment created = new Payment();
        created.setStatus(Payment.Status.CREATED);
        when(paymentRepository.findByBookingId(bookingId)).thenReturn(Optional.of(created));

        paymentService.refund(bookingId, tutorId);

        verifyNoInteractions(ledgerEntryRepository);
    }

    @Test
    void release_isANoOpWhenNoPaymentWasCaptured() {
        when(paymentRepository.findByBookingId(bookingId)).thenReturn(Optional.empty());

        paymentService.release(bookingId, tutorId);

        verifyNoInteractions(ledgerEntryRepository);
    }

    @Test
    void release_deductsCommissionAndMarksThePaymentReleased() {
        Payment captured = new Payment();
        captured.setBookingId(bookingId);
        captured.setAmount(new BigDecimal("1000.00"));
        captured.setStatus(Payment.Status.CAPTURED);
        when(paymentRepository.findByBookingId(bookingId)).thenReturn(Optional.of(captured));

        paymentService.release(bookingId, tutorId);

        var ledgerCaptor = org.mockito.ArgumentCaptor.forClass(LedgerEntry.class);
        verify(ledgerEntryRepository).save(ledgerCaptor.capture());
        LedgerEntry entry = ledgerCaptor.getValue();
        assertThat(entry.getType()).isEqualTo(LedgerEntry.Type.RELEASE);
        assertThat(entry.getAmount()).isEqualByComparingTo("850.00"); // 1000 * (1 - 0.15)
        assertThat(captured.getStatus()).isEqualTo(Payment.Status.RELEASED);
    }

    @Test
    void handleWebhookEvent_rejectsAnInvalidSignatureBeforeTouchingAnything() {
        try (MockedStatic<Utils> utils = mockStatic(Utils.class)) {
            utils.when(() -> Utils.verifyWebhookSignature(anyString(), anyString(), anyString()))
                    .thenReturn(false);

            assertThatThrownBy(() -> paymentService.handleWebhookEvent("{}", "bad-signature"))
                    .isInstanceOf(InvalidWebhookSignatureException.class);

            verifyNoInteractions(paymentRepository);
        }
    }

    @Test
    void handleWebhookEvent_ignoresAnAlreadyProcessedEventId() {
        String payload = """
                {"id": "evt_123", "event": "payment.captured", "payload": {"payment": {"entity": {"order_id": "order_1", "id": "pay_1"}}}}
                """;

        try (MockedStatic<Utils> utils = mockStatic(Utils.class)) {
            utils.when(() -> Utils.verifyWebhookSignature(anyString(), anyString(), anyString()))
                    .thenReturn(true);
            when(paymentRepository.existsByRazorpayEventId("evt_123")).thenReturn(true);

            paymentService.handleWebhookEvent(payload, "sig");

            // Idempotency: a retried webhook with an already-seen event id must never
            // look up the order or touch the booking a second time.
            verify(paymentRepository, never()).findByRazorpayOrderId(any());
            verifyNoInteractions(bookingService);
        }
    }
}
