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
