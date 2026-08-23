# KineGuide AI Agent Guide

This file is the authoritative repository-wide instruction set for AI coding agents. Apply it to every file in this monorepo. More specific instructions in `.agent/rules/` and repository-local skills refine these rules but may not weaken safety, privacy, architecture, or verification requirements.

## Mission

Build KineGuide AI as a safe, explainable physiotherapy support and educational prototype. Deliver small verified changes that preserve clear service ownership and are easy for a two-person university team to review.

KineGuide AI does not diagnose disease and does not replace a physician, physiotherapist, or qualified healthcare professional.

## Instruction priority

1. Follow the user's current request.
2. Follow this `AGENTS.md`.
3. Follow the matching scoped rule in `.agent/rules/`.
4. Load the matching skill from `.agents/skills/`.
5. Follow established code, tests, contracts, and documentation in the affected area.

When instructions conflict, preserve the safer medical, privacy, security, and data-integrity behavior and report the conflict.

## Before changing anything

1. Inspect `git status --short --branch`, the affected files, and nearby tests.
2. Read the matching rule and skill listed below.
3. Identify the user-visible outcome, affected services, data sensitivity, and clinical-safety impact.
4. For multi-step work, maintain a task plan. Do not create disposable planning files for trivial work.
5. Define a verification signal before implementation. For bug fixes and behavior changes, prefer a failing test at the real failure seam before the fix.
6. Preserve unrelated user changes and never use destructive Git commands.

## Non-negotiable architecture

```text
Browser / React PWA
  ├─ browser-only camera and pose processing
  └─ REST/JSON → Go Main API
                    ├─ PostgreSQL
                    └─ internal REST/JSON → Python AI Service
                                                └─ LLM provider abstraction
```

- The browser calls the Go API, never PostgreSQL or Python directly.
- The Go API is the only owner of primary PostgreSQL access.
- The Python service is internal, stateless by default, and has no primary database credentials.
- Raw camera frames, images, and videos remain in the browser. APIs receive only approved derived metrics.
- Caddy is the integrated entry point; direct service ports exist for development and diagnostics.
- Public Go behavior is documented in `packages/contracts/openapi/kineguide-api.yaml`.

Do not bypass these boundaries for convenience.

## Repository map and ownership

| Path                 | Ownership                                                                 |
| -------------------- | ------------------------------------------------------------------------- |
| `apps/web`           | React, PWA, localization, accessibility, camera, pose, browser tests      |
| `services/api-go`    | Public API, orchestration, authentication boundary, PostgreSQL, AI client |
| `services/ai-python` | Bounded text processing and provider adapters                             |
| `packages/contracts` | Public OpenAPI source of truth                                            |
| `packages/ui`        | Proven cross-application UI primitives only                               |
| `database`           | Reversible migrations and synthetic seeds                                 |
| `infrastructure`     | Caddy and shared container support                                        |
| `.github`            | CI, issue forms, and pull request workflow                                |
| `docs`               | Architecture, API, database, privacy, research, and clinical references   |
| `research`           | Reproducible non-sensitive research definitions; never tracked datasets   |

## Repository-local skills

Load a skill when its trigger matches the task:

| Skill                               | Use for                                                       |
| ----------------------------------- | ------------------------------------------------------------- |
| `$develop-kineguide-feature`        | Cross-service or end-to-end feature slices                    |
| `$build-kineguide-web`              | React, TypeScript, PWA, camera, pose, accessibility, i18n     |
| `$build-kineguide-go-api`           | Gin, middleware, repositories, PostgreSQL, AI client, auth    |
| `$build-kineguide-ai-service`       | FastAPI, Pydantic, providers, bounded AI behavior             |
| `$evolve-kineguide-contracts`       | Endpoints, schemas, errors, clients, versioning               |
| `$migrate-kineguide-database`       | Migrations, sqlc, indexes, repositories, seeds                |
| `$review-kineguide-clinical-safety` | Symptoms, red flags, exercises, pose feedback, plans          |
| `$protect-kineguide-data`           | Health data, secrets, auth, logs, consent, retention          |
| `$operate-kineguide-infrastructure` | Docker, Compose, Caddy, CI, Makefile, health checks           |
| `$diagnose-kineguide-system`        | Bugs, degraded readiness, integration or performance failures |

Use the smallest set that covers the task. Read each selected `SKILL.md` completely before acting.

## Implementation principles

- Prefer the smallest complete solution over speculative abstraction.
- Keep modules cohesive and dependencies explicit.
- Add an interface when there is a real alternate adapter, external seam, or deterministic test need.
- Keep functions focused; name by domain intent rather than implementation detail.
- Validate at trust boundaries and keep invariants close to the owning domain.
- Carry cancellation and bounded timeouts through network and database I/O.
- Return actionable errors internally and safe, consistent errors externally.
- Use structured logs with request IDs; never log secrets or sensitive payloads.
- Update examples, docs, and environment templates when behavior changes.
- Add dependencies only when existing libraries or the standard library are insufficient.

## Web rules

- Default to Thai and add the English translation in the same change.
- Keep feature code in `src/features/<feature>`; keep app-wide primitives in `components`, `hooks`, `lib`, or `services`.
- Use TanStack Query for server state, React Hook Form plus Zod for forms, and local React state for local interaction.
- Do not add Zustand unless multiple distant consumers need durable client-only state.
- Centralize and validate environment values.
- Provide accessible loading, empty, success, degraded, and failure states.
- Stop camera tracks on every exit path and never upload raw camera media.
- Test observable behavior, not implementation details.

## Go rules

- Keep `main` limited to configuration, dependency wiring, lifecycle, and shutdown.
- Keep HTTP concerns in handlers/middleware, business behavior in services, persistence in repositories, and AI calls in `internal/client/ai`.
- Validate external input and use the standard JSON error envelope.
- Wrap errors with context; never expose SQL, credentials, internal URLs, or stack traces.
- Use `context.Context` for database and network work.
- Prefer table-driven tests, `httptest`, and small deterministic dependency adapters.
- Run formatting, vet, tests, and build for every Go change.

## Python AI rules

- Use strict Pydantic schemas for every request, response, and structured provider result.
- Keep provider behavior behind the provider protocol.
- Preserve the deterministic disabled provider.
- Never add primary database access.
- Never let an LLM make final diagnostic, red-flag, exercise-selection, dosage, or progression decisions.
- Do not log health prompts or provider responses by default.
- Require deterministic tests and run Ruff, mypy, pytest, and startup validation.

## API contract rules

- Update OpenAPI, implementation, typed consumers, examples, and tests together.
- Prefer backward-compatible additions; explicitly plan breaking changes.
- Document authentication, validation, status codes, error shapes, nullability, units, and coordinate systems.
- Use UUID strings and UTC RFC 3339 timestamps for persisted resources.
- Never claim synchronization without running contract validation and affected tests.

## Database rules

- Use paired sequential up/down migrations.
- Never modify a migration already applied outside disposable local development.
- Use UUID primary keys, `timestamptz`, explicit constraints, and query-justified indexes.
- Keep seeds synthetic and non-medical.
- Do not store raw camera media, credentials, model artifacts, or unnecessary provider content.
- Require explicit authorization and a rollback/backup plan for destructive data operations.

## Healthcare safety

- Do not invent diagnoses, red-flag criteria, exercise protocols, joint-angle thresholds, or treatment plans.
- Require a traceable clinical source and qualified reviewer for every clinical rule.
- Treat pose estimates and LLM output as uncertain supporting information.
- Present service/model failures honestly; never replace unavailable results with confident synthetic content.
- Preserve stop conditions, pain reporting, escalation paths, informed consent, and accessibility where relevant.
- Stop and request a clinical-owner decision when safety behavior is undefined.

## Privacy and security

- Minimize data before securing it.
- Never commit `.env`, credentials, tokens, health information, datasets, recordings, uploads, or model artifacts.
- Keep secrets server-side and use environment or approved secret management.
- Deny access by default and test unauthorized, forbidden, expired, invalid, and deleted states.
- Define purpose, consent, retention, export, correction, and deletion before persisting health data.
- Do not claim regulatory compliance without formal evidence.

## Testing and verification

Run the narrowest useful loop while developing, then all affected checks:

```bash
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
VITE_API_BASE_URL=/api/v1 corepack pnpm build

cd services/api-go
go fmt ./...
go vet ./...
go test ./...
go build ./cmd/server

cd services/ai-python
uv run ruff check .
uv run ruff format --check .
uv run mypy app
uv run pytest

docker compose config
```

Use `go test -race ./...` when supported. For integrated changes, build and start Compose, verify health/readiness/docs/frontend behavior, then shut it down. Distinguish a host Docker failure from a project failure.

Never report a check as passed unless it actually completed successfully.

## Git and collaboration

- Permanent branches are `main` and `develop`.
- Create `feature/<issue>-<name>`, `fix/<issue>-<name>`, or `docs/<issue>-<name>` from `develop`.
- Open focused pull requests into `develop`; promote verified releases to `main`.
- Use Conventional Commits and link the issue with `Closes #<issue>`.
- Do not push directly to `main`, force-push protected branches, invent remotes, change global Git configuration, or commit unrelated changes.
- Do not commit unless the user requests it or the governing task explicitly authorizes it.

## Completion checklist

- Behavior and service ownership match the request.
- Tests cover the new behavior and important failure paths.
- Formatting, lint, type checks, tests, and builds pass for affected areas.
- OpenAPI, migrations, environment examples, and documentation are synchronized.
- No secret, sensitive data, generated artifact, or unrelated change is staged.
- Medical, privacy, security, accessibility, and operational implications are reported.
- Temporary processes, debug instrumentation, and project containers are stopped.
