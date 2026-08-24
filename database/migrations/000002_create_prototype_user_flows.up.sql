CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    display_name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT refresh_tokens_expiry_after_creation CHECK (expires_at > created_at)
);

CREATE INDEX refresh_tokens_user_active_idx
    ON refresh_tokens (user_id, expires_at)
    WHERE revoked_at IS NULL;

CREATE TABLE consent_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_version text NOT NULL,
    camera_processing boolean NOT NULL,
    session_summary_storage boolean NOT NULL,
    research_use boolean NOT NULL DEFAULT false,
    accepted_at timestamptz NOT NULL DEFAULT now(),
    revoked_at timestamptz
);

CREATE INDEX consent_records_user_latest_idx
    ON consent_records (user_id, accepted_at DESC);

CREATE TABLE symptom_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concern_area text NOT NULL,
    duration_band text NOT NULL,
    daily_impact text NOT NULL,
    goal text NOT NULL,
    status text NOT NULL DEFAULT 'captured_not_evaluated',
    created_at timestamptz NOT NULL DEFAULT now(),
    retention_until timestamptz NOT NULL DEFAULT (now() + interval '365 days'),
    CONSTRAINT symptom_assessments_status_check
        CHECK (status = 'captured_not_evaluated')
);

CREATE INDEX symptom_assessments_user_created_idx
    ON symptom_assessments (user_id, created_at DESC);

CREATE TABLE exercise_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_slug text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    camera_used boolean NOT NULL DEFAULT false,
    manual_repetitions integer NOT NULL DEFAULT 0,
    elapsed_seconds integer NOT NULL DEFAULT 0,
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    retention_until timestamptz NOT NULL DEFAULT (now() + interval '365 days'),
    CONSTRAINT exercise_sessions_status_check
        CHECK (status IN ('active', 'completed', 'stopped')),
    CONSTRAINT exercise_sessions_repetitions_check
        CHECK (manual_repetitions >= 0 AND manual_repetitions <= 1000),
    CONSTRAINT exercise_sessions_elapsed_check
        CHECK (elapsed_seconds >= 0 AND elapsed_seconds <= 86400)
);

CREATE INDEX exercise_sessions_user_started_idx
    ON exercise_sessions (user_id, started_at DESC);
