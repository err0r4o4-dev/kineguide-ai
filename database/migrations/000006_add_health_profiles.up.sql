CREATE TABLE health_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    birth_date date NOT NULL,
    sex text NOT NULL,
    height_cm numeric(5, 1) NOT NULL,
    weight_kg numeric(5, 1) NOT NULL,
    track_weight boolean NOT NULL DEFAULT false,
    care_areas text[] NOT NULL,
    recent_injury boolean NOT NULL,
    clinician_managed boolean NOT NULL,
    assistive_device text NOT NULL,
    warning_signs text[] NOT NULL,
    goals text[] NOT NULL,
    activity_level text NOT NULL,
    preferred_time text NOT NULL,
    equipment text[] NOT NULL,
    camera_preference text NOT NULL,
    activity_notifications boolean NOT NULL DEFAULT false,
    notes text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'captured_not_evaluated',
    consent_version text NOT NULL,
    consented_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    retention_until timestamptz NOT NULL DEFAULT (now() + interval '365 days'),
    CONSTRAINT health_profiles_birth_date_check CHECK (birth_date <= CURRENT_DATE),
    CONSTRAINT health_profiles_sex_check CHECK (sex IN ('female', 'male', 'unspecified')),
    CONSTRAINT health_profiles_height_check CHECK (height_cm > 0 AND height_cm <= 300),
    CONSTRAINT health_profiles_weight_check CHECK (weight_kg > 0 AND weight_kg <= 500),
    CONSTRAINT health_profiles_care_areas_check CHECK (
        cardinality(care_areas) > 0 AND
        care_areas <@ ARRAY['lower_back', 'knee', 'shoulder', 'general_mobility', 'prefer_not_to_say']::text[]
    ),
    CONSTRAINT health_profiles_assistive_device_check CHECK (
        assistive_device IN ('none', 'cane', 'walker', 'wheelchair', 'other')
    ),
    CONSTRAINT health_profiles_warning_signs_check CHECK (
        cardinality(warning_signs) > 0 AND
        warning_signs <@ ARRAY['chest_pain', 'shortness_of_breath', 'dizziness_or_fainting', 'weakness_or_severe_fatigue', 'severe_pain', 'none']::text[]
    ),
    CONSTRAINT health_profiles_goals_check CHECK (
        cardinality(goals) > 0 AND
        goals <@ ARRAY['strength', 'balance_fall_prevention', 'flexibility', 'daily_activity', 'progress']::text[]
    ),
    CONSTRAINT health_profiles_activity_level_check CHECK (activity_level IN ('low', 'moderate', 'regular')),
    CONSTRAINT health_profiles_preferred_time_check CHECK (preferred_time IN ('morning', 'afternoon', 'evening')),
    CONSTRAINT health_profiles_equipment_check CHECK (
        cardinality(equipment) > 0 AND
        equipment <@ ARRAY['chair', 'mat', 'resistance_band', 'none']::text[]
    ),
    CONSTRAINT health_profiles_camera_preference_check CHECK (camera_preference IN ('front', 'rear')),
    CONSTRAINT health_profiles_notes_check CHECK (char_length(notes) <= 300),
    CONSTRAINT health_profiles_status_check CHECK (status = 'captured_not_evaluated'),
    CONSTRAINT health_profiles_consent_version_check CHECK (consent_version = 'health-profile-v1'),
    CONSTRAINT health_profiles_retention_check CHECK (retention_until > consented_at)
);
