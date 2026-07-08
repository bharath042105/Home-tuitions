CREATE TABLE bookings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          UUID NOT NULL REFERENCES student_profiles(id),
    parent_id           UUID REFERENCES parent_profiles(id),
    tutor_id            UUID NOT NULL REFERENCES tutor_profiles(id),
    subject             VARCHAR(100) NOT NULL,
    mode                VARCHAR(10) NOT NULL CHECK (mode IN ('ONLINE','OFFLINE')),
    time_range          TSTZRANGE NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING_TUTOR_ACTION'
                            CHECK (status IN ('PENDING_TUTOR_ACTION','REJECTED','PENDING_PAYMENT',
                                               'EXPIRED','CONFIRMED','COMPLETED','DISPUTED','CANCELLED')),
    payment_deadline    TIMESTAMPTZ,
    last_transition_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT no_overlapping_confirmed_bookings
        EXCLUDE USING gist (tutor_id WITH =, time_range WITH &&)
        WHERE (status = 'CONFIRMED')
);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_tutor ON bookings(tutor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_time_range ON bookings USING GIST(time_range);

CREATE TABLE payments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id              UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    razorpay_order_id        VARCHAR(100) UNIQUE,
    razorpay_payment_id      VARCHAR(100),
    razorpay_event_id        VARCHAR(100) UNIQUE,
    amount                   NUMERIC(10,2) NOT NULL,
    status                   VARCHAR(20) NOT NULL DEFAULT 'CREATED'
                                CHECK (status IN ('CREATED','AUTHORIZED','CAPTURED','RELEASED','REFUNDED','FAILED')),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE TABLE ledger_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID NOT NULL REFERENCES bookings(id),
    tutor_id    UUID NOT NULL REFERENCES tutor_profiles(id),
    type        VARCHAR(10) NOT NULL CHECK (type IN ('HOLD','RELEASE','REFUND')),
    amount      NUMERIC(10,2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ledger_tutor ON ledger_entries(tutor_id);
CREATE INDEX idx_ledger_booking ON ledger_entries(booking_id);

CREATE TABLE payouts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id        UUID NOT NULL REFERENCES tutor_profiles(id),
    total_amount    NUMERIC(10,2) NOT NULL,
    status          VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID')),
    bank_reference  VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at         TIMESTAMPTZ
);

CREATE TABLE payout_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_id         UUID NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
    ledger_entry_id   UUID NOT NULL REFERENCES ledger_entries(id),
    amount            NUMERIC(10,2) NOT NULL,
    UNIQUE(ledger_entry_id)
);
