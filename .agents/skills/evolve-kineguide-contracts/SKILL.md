---
name: evolve-kineguide-contracts
description: Evolve and validate KineGuide AI HTTP contracts across OpenAPI, Go handlers, Python internal schemas, and typed web clients. Use when adding or changing endpoints, request or response fields, status codes, error shapes, versioning, or dependency states.
---

# Evolve KineGuide Contracts

Treat `packages/contracts/openapi/kineguide-api.yaml` as the public Go API source of truth.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/api-contracts.md`, existing handlers, consumers, and tests.
2. Define behavior before implementation: path, method, authentication, request schema, response schema, errors, idempotency, and privacy classification.
3. Prefer backward-compatible additions. Require an explicit migration or versioning plan for removals, renames, semantic changes, or stricter validation.
4. Reuse `HealthResponse`, `DependencyStatus`, `SystemStatusResponse`, and `ErrorResponse` where applicable.
5. Update the OpenAPI document, Go implementation, web types/client, examples, and tests in one change.
6. Keep internal Go-to-Python schemas explicit even when they are not part of public OpenAPI.
7. Run Redocly validation and every affected service test/build.

## Contract rules

- Use consistent JSON naming and UTC RFC 3339 timestamps.
- Represent identifiers as UUID strings when persisted.
- Document all non-2xx responses with the standard error envelope.
- Do not expose credentials, internal URLs, SQL errors, provider details, or raw health records.
- Do not silently change nullability, units, coordinate systems, or clinical meaning.
- Never claim the implementation and contract are synchronized without testing both.
