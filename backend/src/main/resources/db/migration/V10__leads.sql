CREATE TABLE tuition_inquiries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade           VARCHAR(50) NOT NULL,
    board           VARCHAR(50) NOT NULL,
    subjects        TEXT NOT NULL,
    tuition_mode    VARCHAR(20) NOT NULL,
    address         TEXT,
    timings         VARCHAR(100) NOT NULL,
    frequency       VARCHAR(50),
    parent_name     VARCHAR(150) NOT NULL,
    mobile          VARCHAR(15) NOT NULL,
    email           VARCHAR(200),
    budget          VARCHAR(50),
    remarks         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','CONTACTED','CLOSED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tuition_inquiries_status_created ON tuition_inquiries(status, created_at);

CREATE TABLE tutor_applications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(150) NOT NULL,
    father_name         VARCHAR(150),
    qualification       VARCHAR(150) NOT NULL,
    college             VARCHAR(200) NOT NULL,
    percentage          VARCHAR(10) NOT NULL,
    pass_year           VARCHAR(4) NOT NULL,
    inter_college       VARCHAR(200),
    inter_percentage    VARCHAR(10),
    school_name         VARCHAR(200),
    school_percentage   VARCHAR(10),
    localities          TEXT NOT NULL,
    commute_distance    VARCHAR(50),
    grades              TEXT NOT NULL,
    subjects            TEXT NOT NULL,
    boards              TEXT NOT NULL,
    medium              VARCHAR(50),
    mode                VARCHAR(20) NOT NULL,
    mobile              VARCHAR(15) NOT NULL,
    whatsapp            VARCHAR(15) NOT NULL,
    alternative_phone    VARCHAR(15),
    email               VARCHAR(200) NOT NULL,
    occupation          VARCHAR(50),
    experience          VARCHAR(50),
    expected_rate       VARCHAR(50) NOT NULL,
    timings             VARCHAR(100),
    bio                 TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','CONTACTED','CLOSED')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tutor_applications_status_created ON tutor_applications(status, created_at);

CREATE TABLE contact_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    phone       VARCHAR(15) NOT NULL,
    email       VARCHAR(200),
    message     TEXT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','CONTACTED','CLOSED')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contact_messages_status_created ON contact_messages(status, created_at);
