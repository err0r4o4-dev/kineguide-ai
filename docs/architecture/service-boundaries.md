# Service boundaries

| Component | Owns | Must not own |
| --- | --- | --- |
| React Web/PWA | UI, consent presentation, browser camera, derived pose metrics | Database access, diagnosis, raw-video upload |
| Go Main API | REST contract, authentication boundary, business orchestration, PostgreSQL access | Camera processing, unreviewed model decisions |
| Python AI Service | Bounded text processing and transient technical visibility feedback | Primary database access, raw media, red-flag decisions, exercise selection, diagnosis, prescriptions |
| PostgreSQL | Application records managed by Go | Videos, credentials, model binaries |

Services exchange versioned JSON over HTTP. Timeouts, request IDs, structured errors, and health checks make failures observable. No runtime service shares database credentials with the AI service.

The browser may send the Go API only pose status and bounded visibility scores after an explicit technical-feedback action. It never sends frames, recordings, images, face/hand data, blink estimates, or landmark coordinates. Go verifies session ownership before calling Python and does not persist the technical payload or response.
