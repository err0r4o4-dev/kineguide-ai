# Go Main API

The Go service is KineGuide AI's public application boundary and the only service allowed to access PostgreSQL. It provides liveness, dependency readiness, system status, and OpenAPI documentation without exposing connection details.

Run `go mod download`, `go run ./cmd/server`, and `go test ./...` from this directory after copying `.env.example` to a local ignored `.env`.

Endpoints include system health/status, authentication and consent, account-owned activity records, and the `/v1/conversations` text-chat boundary documented in OpenAPI. Conversation creation and message generation require explicit AI-chat storage consent under the current policy. Successful exchanges remain stored until the owner deletes the conversation or account; failed provider calls are not persisted.

`GET /v1/activities` serves the demo-only sitting, standing, sit-to-stand, and walking catalog. `/v1/exercises` remains a deprecated compatibility alias. Session responses expose preferred activity fields alongside legacy exercise fields while clients migrate; neither form contains pose frames or landmark sequences.

The authenticated `/v1/health-profile` boundary stores, returns, corrects, and deletes the bounded first-login profile for its owning account. Saving requires active base consent and explicit `health-profile-v1` storage consent. The API does not interpret the answers, send them to the AI service, or use them to personalize the demo activity plan.

The `internal/security` package provides Argon2id password hashing and short-lived JWT access tokens. Product handlers use rotating opaque refresh tokens stored as hashes in PostgreSQL and delivered to the browser as HttpOnly cookies. Every consent, assessment, and session query is scoped to the authenticated user.

Social sign-in is disabled unless the matching client ID and client secret are configured. Register the exact Google and Facebook callback URLs from `.env.example` with each provider. Provider credentials remain server-side; provider access and refresh tokens are never persisted.
