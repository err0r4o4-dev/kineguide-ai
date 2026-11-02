ALTER TABLE exercise_sessions
    DROP CONSTRAINT IF EXISTS exercise_sessions_posture_summary_all_or_none,
    DROP CONSTRAINT IF EXISTS exercise_sessions_posture_method_check,
    DROP CONSTRAINT IF EXISTS exercise_sessions_posture_framing_check,
    DROP CONSTRAINT IF EXISTS exercise_sessions_posture_break_check,
    DROP CONSTRAINT IF EXISTS exercise_sessions_posture_alert_check,
    DROP CONSTRAINT IF EXISTS exercise_sessions_posture_unassessed_check,
    DROP CONSTRAINT IF EXISTS exercise_sessions_posture_needs_adjust_check,
    DROP CONSTRAINT IF EXISTS exercise_sessions_posture_good_check;

ALTER TABLE exercise_sessions
    DROP COLUMN IF EXISTS posture_method_version,
    DROP COLUMN IF EXISTS posture_framing_mode,
    DROP COLUMN IF EXISTS posture_break_count,
    DROP COLUMN IF EXISTS posture_alert_count,
    DROP COLUMN IF EXISTS posture_unassessed_seconds,
    DROP COLUMN IF EXISTS posture_needs_adjust_seconds,
    DROP COLUMN IF EXISTS posture_good_seconds;
