package com.hometuitions.backend.payment.controller;

import com.hometuitions.backend.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/webhooks/razorpay")
@Tag(name = "Razorpay Webhook")
public class RazorpayWebhookController {

    private final PaymentService paymentService;

    public RazorpayWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Public endpoint (see SecurityConfig) - Razorpay authenticates itself via the
     * X-Razorpay-Signature HMAC header, not a JWT. @RequestBody String captures the
     * exact raw bytes Razorpay signed; re-serializing a parsed object here would risk
     * a byte-for-byte mismatch against the signature (field ordering, whitespace).
     */
    @PostMapping
    public ResponseEntity<Void> handleWebhook(@RequestBody String rawPayload,
                                               @RequestHeader("X-Razorpay-Signature") String signature) {
        paymentService.handleWebhookEvent(rawPayload, signature);
        return ResponseEntity.ok().build();
    }
}
