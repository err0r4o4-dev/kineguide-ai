# Database design

The foundation creates `application_metadata` plus prototype account, refresh-token, consent, bounded structured-assessment, and activity-session records. Application records use UUID primary keys (`gen_random_uuid()`), `timestamptz` timestamps interpreted in UTC, explicit foreign keys, and migration-controlled schema changes. Migration files always provide up and down paths.

Assessment answers intentionally exclude free text and have no diagnostic or red-flag interpretation. Assessment and session records carry a 365-day retention target and are deleted when the owning account is deleted. Raw images and videos are never stored.

Still-planned entities include clinician-reviewed safety rules, exercise protocols, joint-angle rules, rehabilitation plans, pose metrics, feedback, clinical references, and privacy-safe audit events.

This list is a planning inventory, not an approved schema. Data classification, retention, deletion, audit, and clinical ownership must be resolved before each entity is implemented. Never store raw images or videos. Seeds must contain synthetic, non-health data only.
