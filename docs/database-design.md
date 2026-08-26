# Database design

The foundation creates `application_metadata` plus prototype account, refresh-token, consent, bounded structured-assessment, and activity-session records. Application records use UUID primary keys (`gen_random_uuid()`), `timestamptz` timestamps interpreted in UTC, explicit foreign keys, and migration-controlled schema changes. Migration files always provide up and down paths.

`auth_identities` links a KineGuide account to the minimum stable external identifier: provider name plus provider-scoped subject. It deliberately excludes provider tokens, profile payloads, and health data. Identity rows are removed with account deletion. A social-only account has a null password hash; the application prevents disconnecting its last remaining sign-in method.

Assessment answers intentionally exclude free text and have no diagnostic or red-flag interpretation. Assessment and session records carry a 365-day retention target and are deleted when the owning account is deleted. Raw images and videos are never stored.

AI chat is separately consented free text and may contain sensitive health information. Conversations and their messages are owned by one account, expire 30 days after conversation creation, cascade on account or conversation deletion, and are physically removed by the Go API retention worker. Provider prompts and responses must not be logged.

Still-planned entities include clinician-reviewed safety rules, exercise protocols, joint-angle rules, rehabilitation plans, pose metrics, feedback, clinical references, and privacy-safe audit events.

This list is a planning inventory, not an approved schema. Data classification, retention, deletion, audit, and clinical ownership must be resolved before each entity is implemented. Never store raw images or videos. Seeds must contain synthetic, non-health data only.
