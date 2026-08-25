DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE password_hash IS NULL) THEN
        RAISE EXCEPTION 'cannot remove OAuth identities while social-only accounts exist';
    END IF;
END $$;

DROP TABLE IF EXISTS auth_identities;

ALTER TABLE users
    ALTER COLUMN password_hash SET NOT NULL;
