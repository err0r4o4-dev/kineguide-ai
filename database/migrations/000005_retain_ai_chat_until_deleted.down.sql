ALTER TABLE conversations
    ADD COLUMN retention_until timestamptz;

UPDATE conversations
SET retention_until = GREATEST(created_at + interval '30 days', now() + interval '30 days');

ALTER TABLE conversations
    ALTER COLUMN retention_until SET DEFAULT (now() + interval '30 days'),
    ALTER COLUMN retention_until SET NOT NULL,
    ADD CONSTRAINT conversations_retention_check
        CHECK (retention_until > created_at);

ALTER TABLE conversation_messages
    ADD COLUMN retention_until timestamptz;

UPDATE conversation_messages AS message
SET retention_until = conversation.retention_until
FROM conversations AS conversation
WHERE conversation.id = message.conversation_id;

ALTER TABLE conversation_messages
    ALTER COLUMN retention_until SET NOT NULL,
    ADD CONSTRAINT conversation_messages_retention_check
        CHECK (retention_until > created_at);

ALTER TABLE conversations
    DROP CONSTRAINT conversations_retention_policy_check,
    DROP COLUMN retention_policy;
