ALTER TABLE exercise_sessions
    ADD COLUMN activity_kind text NOT NULL DEFAULT 'static_posture',
    ADD COLUMN measurement_mode text NOT NULL DEFAULT 'observation';

UPDATE exercise_sessions
SET activity_kind = CASE exercise_slug
        WHEN 'sit-to-stand-demo' THEN 'transition'
        ELSE 'static_posture'
    END,
    measurement_mode = CASE exercise_slug
        WHEN 'sit-to-stand-demo' THEN 'manual_cycles'
        ELSE 'observation'
    END;

ALTER TABLE exercise_sessions
    ADD CONSTRAINT exercise_sessions_activity_kind_check
        CHECK (activity_kind IN ('static_posture', 'transition', 'gait')),
    ADD CONSTRAINT exercise_sessions_measurement_mode_check
        CHECK (measurement_mode IN ('observation', 'hold_duration', 'manual_cycles'));

