ALTER TABLE exercise_sessions
    DROP CONSTRAINT exercise_sessions_measurement_mode_check,
    DROP CONSTRAINT exercise_sessions_activity_kind_check,
    DROP COLUMN measurement_mode,
    DROP COLUMN activity_kind;

