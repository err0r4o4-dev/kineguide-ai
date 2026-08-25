ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;

CREATE TABLE auth_identities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider text NOT NULL,
    provider_subject text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT auth_identities_provider_check
        CHECK (provider IN ('google', 'facebook')),
    CONSTRAINT auth_identities_provider_subject_unique
        UNIQUE (provider, provider_subject),
    CONSTRAINT auth_identities_user_provider_unique
        UNIQUE (user_id, provider)
);

CREATE INDEX auth_identities_user_idx ON auth_identities (user_id);
