---
name: protect-kineguide-data
description: Review and implement KineGuide AI privacy, application security, secrets, logging, consent, retention, and sensitive healthcare-data controls. Use for authentication, authorization, health data, camera or pose data, prompts, audit logs, environment configuration, external providers, uploads, exports, or deletion.
---

# Protect KineGuide Data

Apply data minimization and least privilege before adding controls around unnecessary data.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/privacy-security.md`, `SECURITY.md`, and `docs/privacy-and-security.md`.
2. Map data from collection through processing, storage, logging, sharing, export, retention, and deletion.
3. Classify credentials, identifiers, health data, derived pose metrics, prompts, audit events, and public metadata.
4. Remove unnecessary fields and flows before adding encryption or access control.
5. Define authorization at the Go API boundary. Keep secrets server-side and use environment/secret management.
6. Redact logs and errors; preserve only non-sensitive correlation identifiers.
7. Test denied access, invalid input, expired credentials, deletion, provider failure, and log redaction.
8. Document residual risk and any formal privacy/security review still required.

## Guardrails

- Never commit `.env`, tokens, keys, credentials, patient data, datasets, recordings, or model artifacts.
- Never send raw camera media through an API or to an AI provider.
- Never log passwords, tokens, connection strings, prompts containing health data, or full provider responses.
- Do not claim HIPAA, GDPR, PDPA, medical-device, or other compliance without formal evidence.
- Treat exported files and browser storage as sensitive surfaces.
- Prefer deny-by-default authorization and explicit retention/deletion behavior.
