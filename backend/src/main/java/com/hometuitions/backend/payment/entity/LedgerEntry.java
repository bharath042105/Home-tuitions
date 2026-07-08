package com.hometuitions.backend.payment.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Separate from Payment on purpose (docs/phase2/03-low-level-design.md  2): Payment
 * mirrors Razorpay's view (one row per payment attempt); LedgerEntry is this platform's
 * own record of who owes/is owed what, independent of any single payment attempt -
 * needed for refund partials, disputes, and commission math without tangling those
 * concerns into the provider-facing Payment row.
 */
@Entity
@Table(name = "ledger_entries")
@Getter
@Setter
@NoArgsConstructor
public class LedgerEntry {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;

    @Column(name = "tutor_id", nullable = false)
    private UUID tutorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Type type;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public enum Type { HOLD, RELEASE, REFUND }
}
