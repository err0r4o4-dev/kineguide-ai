# API overview

The public Go API exposes liveness, readiness, dependency status, authentication, versioned consent, bounded structured assessment capture, movement-demo metadata, user-owned session summaries, dashboard statistics, and OpenAPI documentation. See `packages/contracts/openapi/kineguide-api.yaml` for the source contract.

The assessment API does not diagnose, triage, or recommend. Movement demos remain marked as pending clinical review, and the session API explicitly excludes raw camera media and automated form scores. Future safety screening, rehabilitation plans, pose metrics, pain feedback, and administration require separate domain, privacy, and clinical review.
