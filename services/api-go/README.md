# Go Main API

The Go service is KineGuide AI's public application boundary and the only service allowed to access PostgreSQL. It provides liveness, dependency readiness, system status, and OpenAPI documentation without exposing connection details.

Run `go mod download`, `go run ./cmd/server`, and `go test ./...` from this directory after copying `.env.example` to a local ignored `.env`.

Endpoints include system health/status, authentication and consent, account-owned activity records, and the `/v1/conversations` text-chat boundary documented in OpenAPI. Conversation creation and message generation require explicit AI-chat storage consent. Successful exchanges are retained for at most 30 days; failed provider calls are not persisted.

The `internal/security` package provides Argon2id password hashing and short-lived JWT access tokens. Product handlers use rotating opaque refresh tokens stored as hashes in PostgreSQL and delivered to the browser as HttpOnly cookies. Every consent, assessment, and session query is scoped to the authenticated user.

Social sign-in is disabled unless the matching client ID and client secret are configured. Register the exact Google and Facebook callback URLs from `.env.example` with each provider. Provider credentials remain server-side; provider access and refresh tokens are never persisted.
