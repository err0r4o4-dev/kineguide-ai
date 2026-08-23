---
trigger: model_decision
description: Apply to Go, Gin, PostgreSQL repositories, middleware, authentication, health checks, or files under services/api-go.
---

# Go API rule

Use `$build-kineguide-go-api`.

- Keep Go as the public API and sole primary-database owner.
- Validate input, propagate contexts/timeouts, wrap internal errors, and return safe consistent JSON errors.
- Keep handlers, services, repositories, middleware, and AI clients focused on their current responsibility.
- Update OpenAPI for visible behavior and add table-driven or `httptest` coverage.
- Run gofmt, vet, tests, and build.
