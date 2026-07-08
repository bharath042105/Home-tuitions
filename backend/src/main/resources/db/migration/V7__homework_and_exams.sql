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
