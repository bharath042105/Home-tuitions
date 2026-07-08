# Database Schema (Flyway Migrations)

Reference: [04-er-diagram.md](04-er-diagram.md). This is the actual DDL that will be placed into `backend/src/main/resources/db/migration/` in Phase 3, split into versioned files as shown by section. PostgreSQL 15+, requires `pgcrypto` (uuid generation), `postgis`, and `btree_gist` (exclusion constraint) extensions.

## V1__extensions_and_core_auth.sql

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(100),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT','PARENT','TUTOR','ADMIN')),
    status          VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED_EMAIL'
                        CHECK (status IN ('UNVERIFIED_EMAIL','ACTIVE','SUSPENDED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE TABLE device_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fcm_token   VARCHAR(255) NOT NULL,
    platform    VARCHAR(20) NOT NULL CHECK (platform IN ('ANDROID','IOS','WEB')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, fcm_token)
);

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    target_id   VARCHAR(100),
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

*(Note: refresh tokens and OTP codes live in Redis, not Postgres — no migration needed for those; see LLD §3.)*

## V2__profiles.sql

```sql
CREATE TABLE student_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name        VARCHAR(150) NOT NULL,
    grade               VARCHAR(50),
    subjects_of_interest TEXT,
    city                VARCHAR(100),
    location            GEOGRAPHY(Point, 4326),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_student_location ON student_profiles USING GIST(location);

CREATE TABLE parent_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name    VARCHAR(150) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE parent_student_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id       UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    relationship    VARCHAR(50) DEFAULT 'PARENT',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(parent_id, student_id)
);

CREATE TABLE tutor_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio                     TEXT,
    subjects                TEXT[] NOT NULL DEFAULT '{}',
    hourly_rate             NUMERIC(10,2) NOT NULL CHECK (hourly_rate >= 0),
    teaching_mode           VARCHAR(10) NOT NULL CHECK (teaching_mode IN ('ONLINE','OFFLINE','BOTH')),
    service_radius_km       INT DEFAULT 10 CHECK (service_radius_km > 0),
    base_location           GEOGRAPHY(Point, 4326),
    verification_status     VARCHAR(20) NOT NULL DEFAULT 'NOT_SUBMITTED'
                                CHECK (verification_status IN ('NOT_SUBMITTED','SUBMITTED','VERIFIED','REJECTED')),
    avg_rating              NUMERIC(2,1) DEFAULT 0,
    review_count            INT NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tutor_location ON tutor_profiles USING GIST(base_location);
CREATE INDEX idx_tutor_verification_status ON tutor_profiles(verification_status);
CREATE INDEX idx_tutor_subjects ON tutor_profiles USING GIN(subjects);

CREATE TABLE tutor_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id        UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    doc_type        VARCHAR(20) NOT NULL CHECK (doc_type IN ('ID_PROOF','QUALIFICATION')),
    s3_key          VARCHAR(500) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    reject_reason   TEXT,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at     TIMESTAMPTZ
);
CREATE INDEX idx_tutor_documents_tutor ON tutor_documents(tutor_id);
CREATE INDEX idx_tutor_documents_status ON tutor_documents(status);

CREATE TABLE availability_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id    UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    CHECK (end_time > start_time)
);
CREATE INDEX idx_availability_tutor ON availability_rules(tutor_id);
```

## V3__bookings_and_payments.sql

```sql
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
    -- prevents a tutor from holding two overlapping CONFIRMED bookings (LLD  1)
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
    razorpay_event_id        VARCHAR(100) UNIQUE, -- idempotency key for webhook processing
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
    UNIQUE(ledger_entry_id) -- a ledger entry can be paid out at most once
);
```

## V4__classroom_and_reviews.sql

```sql
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
```

## V5__chat_notifications_support.sql

```sql
CREATE TABLE chat_threads (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chat_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id   UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES users(id),
    body        TEXT NOT NULL,
    sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted     BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_id, sent_at);

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,
    payload     JSONB,
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read);

CREATE TABLE support_tickets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raised_by   UUID NOT NULL REFERENCES users(id),
    subject     VARCHAR(200) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','CLOSED')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ticket_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES users(id),
    body        TEXT NOT NULL,
    sent_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## V6__ai_features.sql (fast-follow — schema created now, unused until AI phase wires it up)

```sql
CREATE TABLE ai_conversations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    title       VARCHAR(200),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL CHECK (role IN ('USER','ASSISTANT')),
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id, created_at);

CREATE TABLE ai_usage_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature         VARCHAR(30) NOT NULL CHECK (feature IN ('ASSISTANT','RECOMMENDATION','HOMEWORK_SOLVER','TEST_GENERATOR')),
    tokens_used     INT NOT NULL,
    estimated_cost  NUMERIC(10,4) NOT NULL,
    usage_date      DATE NOT NULL DEFAULT CURRENT_DATE
);
CREATE INDEX idx_ai_usage_user_date ON ai_usage_log(user_id, usage_date);
```

## V7__homework_and_exams.sql (fast-follow)

```sql
CREATE TABLE homework_assignments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id      UUID NOT NULL REFERENCES tutor_profiles(id),
    booking_id    UUID REFERENCES bookings(id),
    title         VARCHAR(200) NOT NULL,
    instructions  TEXT,
    due_at        TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE homework_submissions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id    UUID NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
    student_id       UUID NOT NULL REFERENCES student_profiles(id),
    submission_text  TEXT,
    s3_key           VARCHAR(500),
    grade            NUMERIC(5,2),
    feedback         TEXT,
    submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(assignment_id, student_id)
);

CREATE TABLE exams (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id          UUID NOT NULL REFERENCES tutor_profiles(id),
    title             VARCHAR(200) NOT NULL,
    subject           VARCHAR(100),
    duration_minutes  INT NOT NULL CHECK (duration_minutes > 0)
);

CREATE TABLE exam_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id         UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question        TEXT NOT NULL,
    options         JSONB,
    correct_answer  VARCHAR(500)
);

CREATE TABLE exam_attempts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id       UUID NOT NULL REFERENCES exams(id),
    student_id    UUID NOT NULL REFERENCES student_profiles(id),
    answers       JSONB,
    score         NUMERIC(5,2),
    submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(exam_id, student_id)
);
```

## V8__tutor_display_name.sql (added in Phase 6 — see note below)

```sql
ALTER TABLE tutor_profiles ADD COLUMN display_name VARCHAR(150) NOT NULL DEFAULT '';
ALTER TABLE tutor_profiles ALTER COLUMN display_name DROP DEFAULT;
```

**Post-launch correction**: the original `tutor_profiles` table (above, V2) had no name
field at all — missed until Phase 6's tutor search/discovery needed something to display
in results and on the public profile page. Fixed as an additive V8 migration rather than
editing V2, since Flyway migrations are treated as immutable once shipped regardless of
whether a real environment has actually applied them yet — the discipline is the point.

## V9__student_profile_nullable_user.sql (added in Phase 7 — see note below)

```sql
ALTER TABLE student_profiles ALTER COLUMN user_id DROP NOT NULL;
```

**Post-launch correction #2**: the original `student_profiles.user_id` (V2) was `NOT NULL`,
assuming every Student is a fully independent `User` with their own login. Phase 7 (Parent
module) needs parent-added child sub-profiles with no credentials of their own (US-STU-02)
— and the `users` table's `chk_email_or_phone` constraint rules out creating a credential-less
`User` row per child as a workaround. Making `user_id` nullable is the correct fix;
`UNIQUE(user_id)` already tolerates multiple `NULL`s in Postgres, so no other constraint needed
changing.

## Design Notes

- **UUID PKs** everywhere — avoids sequential-ID enumeration attacks on a public-facing marketplace API, and simplifies future horizontal sharding if ever needed.
- **`TSTZRANGE` + exclusion constraint** on bookings is the single most important integrity guarantee in the schema (LLD §1) — it is what makes "no double-booking" a database-enforced fact, not an application promise.
- **Geography columns + GIST indexes** on tutor/student location power the nearby-search feature (`ST_DWithin(base_location, student_location, radius_m)`) with index support, not a full table scan.
- **All money columns are `NUMERIC(10,2)`**, never `FLOAT`/`DOUBLE` — floating point is not acceptable for currency.
- **Soft delete only on `chat_messages`** (`deleted` flag) — everything else that needs an audit trail relies on `audit_logs` rather than per-table soft-delete flags, keeping most tables simple.
- Migration files V6/V7 exist ahead of their consuming code (per the AI-module-boundary decision in the architecture doc) — this is deliberate schema-first sequencing, not scope creep; no endpoint reads/writes them until the fast-follow phase.
