package com.hometuitions.backend.payment.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentOrderResponse(
        UUID bookingId,
        String razorpayOrderId,
        String razorpayKeyId,
        BigDecimal amount,
        String currency
) {
}
