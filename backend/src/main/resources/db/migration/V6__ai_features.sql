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
