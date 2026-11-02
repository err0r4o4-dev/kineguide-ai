ALTER TABLE exercise_sessions
    ADD COLUMN posture_good_seconds integer,
    ADD COLUMN posture_needs_adjust_seconds integer,
    ADD COLUMN posture_unassessed_seconds integer,
    ADD COLUMN posture_alert_count integer,
    ADD COLUMN posture_break_count integer,
    ADD COLUMN posture_framing_mode text,
    ADD COLUMN posture_method_version text;

ALTER TABLE exercise_sessions
    ADD CONSTRAINT exercise_sessions_posture_good_check
        CHECK (posture_good_seconds IS NULL OR (posture_good_seconds >= 0 AND posture_good_seconds <= 86400)),
    ADD CONSTRAINT exercise_sessions_posture_needs_adjust_check
        CHECK (posture_needs_adjust_seconds IS NULL OR (posture_needs_adjust_seconds >= 0 AND posture_needs_adjust_seconds <= 86400)),
    ADD CONSTRAINT exercise_sessions_posture_unassessed_check
        CHECK (posture_unassessed_seconds IS NULL OR (posture_unassessed_seconds >= 0 AND posture_unassessed_seconds <= 86400)),
    ADD CONSTRAINT exercise_sessions_posture_alert_check
        CHECK (posture_alert_count IS NULL OR (posture_alert_count >= 0 AND posture_alert_count <= 10000)),
    ADD CONSTRAINT exercise_sessions_posture_break_check
        CHECK (posture_break_count IS NULL OR (posture_break_count >= 0 AND posture_break_count <= 1000)),
    ADD CONSTRAINT exercise_sessions_posture_framing_check
        CHECK (posture_framing_mode IS NULL OR posture_framing_mode IN ('upper_body', 'full_torso')),
    ADD CONSTRAINT exercise_sessions_posture_method_check
        CHECK (posture_method_version IS NULL OR posture_method_version IN ('seated-baseline-v1')),
    ADD CONSTRAINT exercise_sessions_posture_summary_all_or_none
        CHECK (
            (
                posture_good_seconds IS NULL AND
                posture_needs_adjust_seconds IS NULL AND
                posture_unassessed_seconds IS NULL AND
                posture_alert_count IS NULL AND
                posture_break_count IS NULL AND
                posture_framing_mode IS NULL AND
                posture_method_version IS NULL
            ) OR (
                posture_good_seconds IS NOT NULL AND
                posture_needs_adjust_seconds IS NOT NULL AND
                posture_unassessed_seconds IS NOT NULL AND
                posture_alert_count IS NOT NULL AND
                posture_break_count IS NOT NULL AND
                posture_framing_mode IS NOT NULL AND
                posture_method_version IS NOT NULL
            )
        );
