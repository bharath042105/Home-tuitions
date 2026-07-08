package com.hometuitions.backend.payment.repository;

import com.hometuitions.backend.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByBookingId(UUID bookingId);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    boolean existsByRazorpayEventId(String razorpayEventId);
}
