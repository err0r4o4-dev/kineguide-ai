---
name: build-kineguide-go-api
description: Build and review the KineGuide AI Go Main API, Gin handlers, middleware, PostgreSQL access, AI client, authentication foundations, health checks, and Go tests. Use for files under services/api-go and Go-owned application behavior.
---

# Build KineGuide Go API

Keep the Go service as the public API boundary and sole owner of primary PostgreSQL access.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/go-api.md`, the OpenAPI contract, and relevant migrations.
2. Trace requests through handler, service, repository, and external client code. Add only packages that provide immediate locality or test seams.
3. Validate untrusted input at the edge. Return consistent JSON responses and errors with request IDs.
4. Carry `context.Context` through I/O; set bounded timeouts; wrap errors with useful context without exposing credentials or health data.
5. Put SQL behind repository methods and generated sqlc code. Do not let Python or the web access PostgreSQL.
6. Treat Python as an unreliable internal dependency: use timeouts, bounded payloads, explicit schemas, and observable degraded states.
7. Update `packages/contracts/openapi/kineguide-api.yaml` with externally visible behavior.
8. Add table-driven unit tests and `httptest` coverage. Use dependency interfaces only where a real alternate or deterministic test adapter exists.
9. Run `go fmt ./...`, `go vet ./...`, `go test ./...`, and `go build ./cmd/server`.

## Security

Use Argon2id for password hashes, short-lived signed access tokens, rotation-capable refresh tokens, least-privilege database credentials, and redacted structured logs. Do not implement authentication or authorization partially across unrelated changes.

## Error behavior

Never panic for expected failures. Map validation, conflict, not-found, unauthorized, forbidden, and dependency failures deliberately. Do not reveal SQL, connection strings, tokens, provider payloads, or stack traces to clients.
