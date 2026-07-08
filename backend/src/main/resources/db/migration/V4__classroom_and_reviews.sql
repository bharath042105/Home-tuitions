CREATE TABLE class_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    agora_channel_name  VARCHAR(100) NOT NULL,
    actual_start        TIMESTAMPTZ,
    actual_end          TIMESTAMPTZ
);

CREATE TABLE attendance_records (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    marked_by   UUID NOT NULL REFERENCES users(id),
    status      VARCHAR(10) NOT NULL CHECK (status IN ('PRESENT','ABSENT')),
    marked_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(booking_id, marked_by)
);

CREATE TABLE disputes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    reason      VARCHAR(200) NOT NULL,
    status      VARCHAR(10) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','RESOLVED')),
    resolution  TEXT,
    resolved_by UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    tutor_id    UUID NOT NULL REFERENCES tutor_profiles(id),
    author_id   UUID NOT NULL REFERENCES users(id),
    rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_tutor ON reviews(tutor_id);
