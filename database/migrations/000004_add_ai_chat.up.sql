ALTER TABLE consent_records
    ADD COLUMN ai_chat_storage boolean NOT NULL DEFAULT false;

CREATE TABLE conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    locale text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    retention_until timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
    CONSTRAINT conversations_title_length_check
        CHECK (char_length(title) BETWEEN 1 AND 120),
    CONSTRAINT conversations_locale_check
        CHECK (locale IN ('th', 'en')),
    CONSTRAINT conversations_retention_check
        CHECK (retention_until > created_at)
);

CREATE INDEX conversations_user_updated_idx
    ON conversations (user_id, updated_at DESC);

CREATE TABLE conversation_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
    conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    retention_until timestamptz NOT NULL,
    CONSTRAINT conversation_messages_role_check
        CHECK (role IN ('user', 'assistant')),
    CONSTRAINT conversation_messages_content_length_check
        CHECK (char_length(content) BETWEEN 1 AND 4000),
    CONSTRAINT conversation_messages_retention_check
        CHECK (retention_until > created_at)
);

CREATE INDEX conversation_messages_conversation_created_idx
    ON conversation_messages (conversation_id, sequence ASC);
