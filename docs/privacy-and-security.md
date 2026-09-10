# Privacy and security principles

- Collect the minimum data needed for a clearly explained purpose and recorded consent.
- Keep camera video on-device; send only required derived landmarks or metrics.
- Never place health information, recordings, credentials, datasets, or model artifacts in Git.
- Restrict PostgreSQL access to the Go API and grant least privilege.
- Keep the AI service stateless and prevent it from making diagnostic or final safety decisions.
- Validate input, encode output, set request limits/timeouts, use structured audit events, and avoid sensitive logs.
- Define retention, export, correction, and deletion procedures before patient data exists.

The prototype stores refresh-token hashes, explicit consent versions, bounded assessment categories, and minimal session summaries. Access tokens remain in browser memory; refresh tokens use HttpOnly cookies. Assessment and session records target 365-day retention and are removed through account deletion. A production deployment still requires scheduled retention enforcement, a reviewed export process, and formal privacy ownership.

The live movement demo loads version-pinned MediaPipe runtime files from jsDelivr and pose plus holistic landmark models from Google-hosted storage only after the user starts the camera flow. These asset requests expose ordinary network metadata such as IP address and user agent to those providers, but camera frames and derived body, face, hand, and estimated blink landmarks remain temporary in browser memory and are not included in the requests, uploaded, or saved. A production or offline deployment should self-host reviewed runtime and model artifacts through an approved artifact pipeline rather than committing model binaries to Git.

AI chat requires a separate consent flag under policy `prototype-v3`. Account-owned conversation text remains stored until the user deletes the conversation or account; database cascades then physically remove the related rows. Failed provider calls do not persist the submitted message. Prompt and response bodies are excluded from application logs. Production backup expiry and deletion replay after a restore still require a formally owned procedure.

The educational clinical-flow catalog contains synthetic public metadata only. Placeholder answers are evaluated transiently and are not stored. During an owner-scoped session, an explicit technical-feedback request may send pose status and up to 33 visibility scores through Go to Python; coordinates, frames, recordings, images, face/hand data, and blink estimates remain in-browser. Go and Python do not persist or log that technical payload or response. Session history stores the public activity identifier and kind, measurement mode, camera-used flag, status, user-entered cycle count when applicable, elapsed time, and timestamps only.

The daily-movement flow supports a demo-only path when the camera is denied, unsupported, or not wanted for that session. Reference-video authoring is not exposed to normal users, and locally generated reference data cannot activate movement correctness feedback.

Social sign-in stores only the provider name and provider-scoped subject linked to the KineGuide user. Provider access tokens are processed transiently by the Go API and discarded. Client secrets remain in server environment configuration, callback errors are intentionally generic, and account deletion cascades to social identities.

First-login health-profile storage requires explicit `health-profile-v1` consent in addition to the active base consent. The Go API stores bounded self-reported profile values for up to 365 days and returns them only to the authenticated owner. The profile screen provides correction and deletion; account deletion also removes the row. Health-profile notes and structured values are not sent to the AI service, do not personalize the current demo plan, and must not appear in logs. Production export, backup-expiry, and scheduled retention enforcement remain release blockers.

This repository is not a claim of HIPAA, GDPR, PDPA, medical-device, or other regulatory compliance. Formal legal, security, and clinical review is required before real-world use.
