# Service boundaries

| Component | Owns | Must not own |
| --- | --- | --- |
| React Web/PWA | UI, consent presentation, browser camera, derived pose metrics | Database access, diagnosis, raw-video upload |
| Go Main API | REST contract, authentication boundary, business orchestration, PostgreSQL access | Camera processing, unreviewed model decisions |
| Python AI Service | Bounded text-processing provider abstraction | Primary database access, red-flag decisions, exercise prescriptions |
| PostgreSQL | Application records managed by Go | Videos, credentials, model binaries |

Services exchange versioned JSON over HTTP. Timeouts, request IDs, structured errors, and health checks make failures observable. No runtime service shares database credentials with the AI service.
