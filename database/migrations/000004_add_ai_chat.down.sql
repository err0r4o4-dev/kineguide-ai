DROP TABLE IF EXISTS conversation_messages;
DROP TABLE IF EXISTS conversations;

ALTER TABLE consent_records
    DROP COLUMN IF EXISTS ai_chat_storage;
