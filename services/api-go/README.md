# Go Main API

The Go service is KineGuide AI's public application boundary and the only service allowed to access PostgreSQL. It provides liveness, dependency readiness, system status, and OpenAPI documentation without exposing connection details.

Run `go mod download`, `go run ./cmd/server`, and `go test ./...` from this directory after copying `.env.example` to a local ignored `.env`.

Endpoints: `GET /health`, `GET /ready`, `GET /api/v1/health`, `GET /api/v1/system/status`, `GET /openapi.json`, and `GET /docs`.

The `internal/security` package provides Argon2id password hashing and short-lived JWT access tokens. Product handlers use rotating opaque refresh tokens stored as hashes in PostgreSQL and delivered to the browser as HttpOnly cookies. Every consent, assessment, and session query is scoped to the authenticated user.
