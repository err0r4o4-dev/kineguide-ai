# Privacy and security principles

- Collect the minimum data needed for a clearly explained purpose and recorded consent.
- Keep camera video on-device; send only required derived landmarks or metrics.
- Never place health information, recordings, credentials, datasets, or model artifacts in Git.
- Restrict PostgreSQL access to the Go API and grant least privilege.
- Keep the AI service stateless and prevent it from making diagnostic or final safety decisions.
- Validate input, encode output, set request limits/timeouts, use structured audit events, and avoid sensitive logs.
- Define retention, export, correction, and deletion procedures before patient data exists.

The prototype stores refresh-token hashes, explicit consent versions, bounded assessment categories, and minimal session summaries. Access tokens remain in browser memory; refresh tokens use HttpOnly cookies. Assessment and session records target 365-day retention and are removed through account deletion. A production deployment still requires scheduled retention enforcement, a reviewed export process, and formal privacy ownership.

This repository is not a claim of HIPAA, GDPR, PDPA, medical-device, or other regulatory compliance. Formal legal, security, and clinical review is required before real-world use.
