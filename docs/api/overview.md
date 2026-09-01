# API overview

The public Go API exposes liveness, readiness, dependency status, authentication, versioned consent, bounded structured assessment capture, movement-demo metadata, user-owned session summaries, dashboard statistics, and OpenAPI documentation. See `packages/contracts/openapi/kineguide-api.yaml` for the source contract.

The assessment API does not diagnose, triage, or recommend. Movement demos remain marked as pending clinical review, and the session API explicitly excludes raw camera media and automated form scores. Future safety screening, rehabilitation plans, pose metrics, pain feedback, and administration require separate domain, privacy, and clinical review.

`GET`, `PUT`, and `DELETE /v1/health-profile` provide owner-only review, upsert, and idempotent deletion of the first-login profile. `PUT` requires active base consent plus `profile_storage_consent: true`; the API records consent version `health-profile-v1` and a 365-day retention deadline. The response status `captured_not_evaluated` makes the non-clinical boundary explicit.

`GET /v1/educational-clinical-flow/catalog` and `POST /v1/educational-clinical-flow/evaluate` expose only versioned mock placeholders and pending-review movement demonstrations after active prototype consent. `POST /v1/sessions/{id}/technical-feedback` accepts transient pose status and visibility values for an owner-scoped session, delegates technical calculation to Python, and returns no diagnosis, treatment, suitability, phase, or automatic repetition claim.
