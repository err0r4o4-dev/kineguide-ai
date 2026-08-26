# Privacy and security principles

- Collect the minimum data needed for a clearly explained purpose and recorded consent.
- Keep camera video on-device; send only required derived landmarks or metrics.
- Never place health information, recordings, credentials, datasets, or model artifacts in Git.
- Restrict PostgreSQL access to the Go API and grant least privilege.
- Keep the AI service stateless and prevent it from making diagnostic or final safety decisions.
- Validate input, encode output, set request limits/timeouts, use structured audit events, and avoid sensitive logs.
- Define retention, export, correction, and deletion procedures before patient data exists.

The prototype stores refresh-token hashes, explicit consent versions, bounded assessment categories, and minimal session summaries. Access tokens remain in browser memory; refresh tokens use HttpOnly cookies. Assessment and session records target 365-day retention and are removed through account deletion. A production deployment still requires scheduled retention enforcement, a reviewed export process, and formal privacy ownership.

AI chat requires a separate consent flag under policy `prototype-v3`. Account-owned conversation text remains stored until the user deletes the conversation or account; database cascades then physically remove the related rows. Failed provider calls do not persist the submitted message. Prompt and response bodies are excluded from application logs. Production backup expiry and deletion replay after a restore still require a formally owned procedure.

Social sign-in stores only the provider name and provider-scoped subject linked to the KineGuide user. Provider access tokens are processed transiently by the Go API and discarded. Client secrets remain in server environment configuration, callback errors are intentionally generic, and account deletion cascades to social identities.

This repository is not a claim of HIPAA, GDPR, PDPA, medical-device, or other regulatory compliance. Formal legal, security, and clinical review is required before real-world use.
