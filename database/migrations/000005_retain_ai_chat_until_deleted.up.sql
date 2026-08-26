ALTER TABLE conversations
    ADD COLUMN retention_policy text NOT NULL DEFAULT 'until_deleted';

ALTER TABLE conversations
    DROP CONSTRAINT conversations_retention_check,
    DROP COLUMN retention_until;

ALTER TABLE conversations
    ADD CONSTRAINT conversations_retention_policy_check
        CHECK (retention_policy = 'until_deleted');

ALTER TABLE conversation_messages
    DROP CONSTRAINT conversation_messages_retention_check,
    DROP COLUMN retention_until;
