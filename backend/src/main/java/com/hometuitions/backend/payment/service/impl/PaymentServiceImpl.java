package com.hometuitions.backend.payment.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hometuitions.backend.booking.service.BookingService;
import com.hometuitions.backend.common.exception.ConflictException;
import com.hometuitions.backend.payment.dto.PaymentOrderResponse;
import com.hometuitions.backend.payment.entity.LedgerEntry;
import com.hometuitions.backend.payment.entity.Payment;
import com.hometuitions.backend.payment.exception.InvalidWebhookSignatureException;
import com.hometuitions.backend.payment.repository.LedgerEntryRepository;
import com.hometuitions.backend.payment.repository.PaymentRepository;
import com.hometuitions.backend.payment.service.PaymentService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.persistence.EntityNotFoundException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final BookingService bookingService;
    private final RazorpayClient razorpayClient;
    private final ObjectMapper objectMapper;
    private final String razorpayKeyId;
    private final String webhookSecret;
    private final BigDecimal commissionRate;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                               LedgerEntryRepository ledgerEntryRepository,
                               BookingService bookingService,
                               RazorpayClient razorpayClient,
                               ObjectMapper objectMapper,
                               @Value("${app.razorpay.key-id}") String razorpayKeyId,
                               @Value("${app.razorpay.webhook-secret}") String webhookSecret,
                               @Value("${app.payment.commission-rate}") BigDecimal commissionRate) {
        this.paymentRepository = paymentRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.bookingService = bookingService;
        this.razorpayClient = razorpayClient;
        this.objectMapper = objectMapper;
        this.razorpayKeyId = razorpayKeyId;
        this.webhookSecret = webhookSecret;
        this.commissionRate = commissionRate;
    }

    @Override
    public PaymentOrderResponse createOrder(UUID bookingId, UUID tutorId, BigDecimal amount) {
        Payment existing = paymentRepository.findByBookingId(bookingId).orElse(null);
        if (existing != null) {
            return toResponse(existing); // already created (e.g. retry) - don't double-create with Razorpay
        }

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValueExact()); // paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", bookingId.toString());
            var order = razorpayClient.orders.create(orderRequest);

            Payment payment = new Payment();
            payment.setBookingId(bookingId);
            payment.setRazorpayOrderId(order.get("id"));
            payment.setAmount(amount);
            payment.setStatus(Payment.Status.CREATED);
            Payment saved = paymentRepository.save(payment);

            return toResponse(saved);
        } catch (RazorpayException e) {
            throw new ConflictException("Could not create payment order: " + e.getMessage());
        }
    }

    @Override
    public PaymentOrderResponse getOrder(UUID bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("No payment order for this booking yet"));
        return toResponse(payment);
    }

    @Override
    public void handleWebhookEvent(String rawPayload, String signatureHeader) {
        boolean validSignature;
        try {
            validSignature = Utils.verifyWebhookSignature(rawPayload, signatureHeader, webhookSecret);
        } catch (RazorpayException e) {
            throw new InvalidWebhookSignatureException("Could not verify webhook signature");
        }
        if (!validSignature) {
            throw new InvalidWebhookSignatureException("Webhook signature does not match");
        }

        JsonNode root = parse(rawPayload);
        String eventId = root.path("id").asText(null);
        String eventType = root.path("event").asText("");

        if (eventId == null || paymentRepository.existsByRazorpayEventId(eventId)) {
            log.info("Ignoring already-processed or malformed webhook event: {}", eventId);
            return; // idempotency - a retried webhook must never apply its side effects twice
        }

        switch (eventType) {
            case "payment.captured" -> handleCaptured(root, eventId);
            case "payment.failed" -> handleFailed(root, eventId);
            default -> log.info("Unhandled Razorpay webhook event type: {}", eventType);
        }
    }

    private void handleCaptured(JsonNode root, String eventId) {
        JsonNode entity = root.path("payload").path("payment").path("entity");
        String orderId = entity.path("order_id").asText(null);
        String paymentId = entity.path("id").asText(null);
        if (orderId == null) return;

        Payment payment = paymentRepository.findByRazorpayOrderId(orderId).orElse(null);
        if (payment == null) {
            log.warn("Received payment.captured for unknown order_id {}", orderId);
            return;
        }

        payment.setRazorpayPaymentId(paymentId);
        payment.setRazorpayEventId(eventId);
        payment.setStatus(Payment.Status.CAPTURED);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);

        var booking = bookingService.confirmPayment(payment.getBookingId());

        LedgerEntry hold = new LedgerEntry();
        hold.setBookingId(payment.getBookingId());
        hold.setTutorId(booking.getTutorId());
        hold.setType(LedgerEntry.Type.HOLD);
        hold.setAmount(payment.getAmount());
        ledgerEntryRepository.save(hold);
    }

    private void handleFailed(JsonNode root, String eventId) {
        JsonNode entity = root.path("payload").path("payment").path("entity");
        String orderId = entity.path("order_id").asText(null);
        if (orderId == null) return;

        paymentRepository.findByRazorpayOrderId(orderId).ifPresent(payment -> {
            payment.setRazorpayEventId(eventId);
            payment.setStatus(Payment.Status.FAILED);
            payment.setUpdatedAt(Instant.now());
            paymentRepository.save(payment);
            // Booking stays PENDING_PAYMENT - BookingExpiryJob (Phase 8) will expire it
            // once the 30-minute payment window elapses; no need to duplicate that logic here.
        });
    }

    @Override
    public void refund(UUID bookingId, UUID tutorId) {
        Payment payment = paymentRepository.findByBookingId(bookingId).orElse(null);
        if (payment == null || payment.getStatus() != Payment.Status.CAPTURED) {
            return; // nothing was ever captured for this booking - not an error, most
                     // cancellations happen before payment
        }

        try {
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", payment.getAmount().multiply(BigDecimal.valueOf(100)).intValueExact());
            razorpayClient.payments.refund(payment.getRazorpayPaymentId(), refundRequest);
        } catch (RazorpayException e) {
            throw new ConflictException("Refund failed: " + e.getMessage());
        }

        payment.setStatus(Payment.Status.REFUNDED);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);

        LedgerEntry refundEntry = new LedgerEntry();
        refundEntry.setBookingId(bookingId);
        refundEntry.setTutorId(tutorId);
        refundEntry.setType(LedgerEntry.Type.REFUND);
        refundEntry.setAmount(payment.getAmount());
        ledgerEntryRepository.save(refundEntry);
    }

    @Override
    public void release(UUID bookingId, UUID tutorId) {
        Payment payment = paymentRepository.findByBookingId(bookingId).orElse(null);
        if (payment == null || payment.getStatus() != Payment.Status.CAPTURED) {
            log.warn("release() called for booking {} with no CAPTURED payment - skipping", bookingId);
            return;
        }

        BigDecimal payable = payment.getAmount().multiply(BigDecimal.ONE.subtract(commissionRate))
                .setScale(2, RoundingMode.HALF_UP);

        LedgerEntry release = new LedgerEntry();
        release.setBookingId(bookingId);
        release.setTutorId(tutorId);
        release.setType(LedgerEntry.Type.RELEASE);
        release.setAmount(payable);
        ledgerEntryRepository.save(release);

        payment.setStatus(Payment.Status.RELEASED);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);
    }

    @Override
    public BigDecimal totalRevenueReleased() {
        return ledgerEntryRepository.sumReleased();
    }

    private PaymentOrderResponse toResponse(Payment payment) {
        return new PaymentOrderResponse(
                payment.getBookingId(), payment.getRazorpayOrderId(), razorpayKeyId,
                payment.getAmount(), "INR");
    }

    private JsonNode parse(String rawPayload) {
        try {
            return objectMapper.readTree(rawPayload);
        } catch (Exception e) {
            throw new InvalidWebhookSignatureException("Malformed webhook payload");
        }
    }
}
