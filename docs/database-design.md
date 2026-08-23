# Database design

The foundation creates only `application_metadata`. Application records will use UUID primary keys (`gen_random_uuid()`), `timestamptz` timestamps interpreted in UTC, explicit foreign keys, and migration-controlled schema changes. Migration files always provide up and down paths.

Planned entities are: User, PatientProfile, ConsentRecord, SymptomAssessment, AssessmentAnswer, SafetyScreening, RedFlagRule, Exercise, ExerciseProtocol, JointAngleRule, RehabilitationPlan, PlanDay, PlanExercise, CameraSession, ExerciseAttempt, PoseMetric, SessionFeedback, ProgressSummary, ClinicalReference, AuditLog, and RefreshToken.

This list is a planning inventory, not an approved schema. Data classification, retention, deletion, audit, and clinical ownership must be resolved before each entity is implemented. Never store raw images or videos. Seeds must contain synthetic, non-health data only.
