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
| `$design-kineguide-web`             | New UI, redesigns, responsive layout, interaction, visual UX  |
| `$implement-kineguide-visual-reference` | Screenshots, mockups, or design references translated to React |
| `$test-kineguide-web`               | Vitest, Testing Library, Playwright, and frontend TDD          |
| `$audit-kineguide-web`              | Accessibility, responsive, privacy, performance, and UX audits |
| `$build-kineguide-go-api`           | Gin, middleware, repositories, PostgreSQL, AI client, auth    |
| `$build-kineguide-ai-service`       | FastAPI, Pydantic, providers, bounded AI behavior             |
| `$evolve-kineguide-contracts`       | Endpoints, schemas, errors, clients, versioning               |
| `$migrate-kineguide-database`       | Migrations, sqlc, indexes, repositories, seeds                |
| `$review-kineguide-clinical-safety` | Symptoms, red flags, exercises, pose feedback, plans          |
| `$protect-kineguide-data`           | Health data, secrets, auth, logs, consent, retention          |
| `$operate-kineguide-infrastructure` | Docker, Compose, Caddy, CI, Makefile, health checks           |
| `$diagnose-kineguide-system`        | Bugs, degraded readiness, integration or performance failures |

Use the smallest set that covers the task. Read each selected `SKILL.md` completely before acting.

For web work, start with `$build-kineguide-web`. Add at most one specialist web skill unless the task genuinely spans implementation and an independent audit. Use `$design-kineguide-web` for new or redesigned interfaces, `$implement-kineguide-visual-reference` only when a real visual reference is provided, `$test-kineguide-web` for test-first or test-focused work, and `$audit-kineguide-web` for reviews. Use `$diagnose-kineguide-system` instead of a design skill for broken behavior or regressions.

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

### Frontend workflow

1. Read `.agent/rules/web.md` and every matching `web-*.md` rule before editing `apps/web`.
2. Inspect the route, feature folder, existing components, translation keys, API client, nearby tests, and `packages/ui/DESIGN_TOKENS.md` before creating new UI.
3. State the user journey, trust boundary, responsive targets, accessibility behavior, and verification signal.
4. Prefer extending an established pattern over adding a parallel component, state store, style system, or HTTP client.
5. For behavior changes, implement a vertical slice with a failing behavior test when a reliable seam exists.
6. Verify the narrow behavior, then run format, lint, type-check, unit tests, and a production build. Add Playwright coverage for critical browser journeys.

### Structure and ownership

- Keep route composition in `src/routes`, domain behavior in `src/features/<feature>`, shared application components in `src/components`, reusable hooks in `src/hooks`, infrastructure helpers in `src/lib`, and Go API calls in `src/services`.
- Keep feature-specific components, schemas, hooks, and tests together. Promote UI into `packages/ui` only after real reuse by more than one application surface.
- Keep components focused on presentation and interaction. Put reusable domain state transitions, geometry, parsing, and validation in deterministic modules.
- Do not create a second router, query client, localization instance, HTTP client, styling system, or form abstraction.

### React, state, data, and forms

- Use strict TypeScript. Avoid `any`, unsafe casts, non-null assertions without proof, and duplicated API types.
- Use TanStack Query for server state, React Hook Form plus Zod for forms, URL state for shareable navigation state, and local React state for local interaction.
- Do not copy query results into local state. Keep query keys stable, abortable, and scoped to the authenticated resource.
- Do not add Zustand or another state library unless multiple distant consumers need durable client-only state and the need is documented.
- Use the centralized Axios client and validated environment configuration. The browser calls only the public Go API.
- Map backend validation errors to specific fields or an accessible form summary. Preserve entered values after recoverable failures.

### UI and responsive behavior

- Read `packages/ui/DESIGN_TOKENS.md` before new UI or a visual redesign. Use semantic colors, the existing 4 px spacing rhythm, consistent typography, and the established Lucide icon set.
- Prefer semantic HTML and natural document flow. Use cards, overlays, animation, gradients, and shadows only when they communicate hierarchy or state.
- Design from 320 px upward and verify at 320, 768, 1024, and 1440 px. Avoid horizontal scrolling, hidden fixed content, and hover-only actions.
- Provide loading, empty, success, degraded, offline, permission-denied, unsupported, and failure states when the user journey can reach them.
- Respect `prefers-reduced-motion`; animate only `transform` and `opacity` when practical and never let motion delay urgent safety information.

### Language and accessibility

- Default to Thai and add the English translation in the same change. Never hardcode user-facing copy in feature components.
- Use semantic landmarks, a logical heading hierarchy, visible keyboard focus, programmatic labels, useful alternative text, live regions for asynchronous feedback, and practical touch targets.
- Do not use color, icon shape, or motion as the only indication of health, confidence, pain, error, or completion.
- Preserve Thai text expansion and line breaking. Do not encode meaning through English abbreviations that are not explained in both languages.

### Camera, pose, privacy, and safety

- Request camera access only after explicit user action and applicable consent. Explain purpose before the browser permission prompt.
- Process raw camera frames and MediaPipe inference only in the browser. Never upload, persist, log, screenshot, or place raw media in test fixtures.
- Stop every `MediaStreamTrack` on cancellation, navigation, unmount, permission failure, device change, and unexpected error.
- Treat landmarks, joint angles, repetition counts, and confidence values as uncertain estimates. Show unavailable and low-confidence states honestly.
- Do not invent clinical thresholds, exercise corrections, pain advice, diagnoses, or progression logic. Require a clinical source and qualified reviewer.

### Performance and PWA

- Keep camera and pose loops out of React render paths. Bound inference frequency and move sustained CPU-heavy work to a typed worker when measurements justify it.
- Clean up timers, subscriptions, animation frames, observers, object URLs, workers, and media tracks.
- Preserve route-level loading behavior and PWA update/offline clarity. Do not cache authenticated health responses or sensitive payloads without an explicit reviewed policy.
- Measure before optimizing. Protect interaction responsiveness, layout stability, startup cost, and memory on realistic mobile hardware.

### Frontend verification

- Test observable behavior with Testing Library and `userEvent`; do not assert internal hook calls or component implementation details.
- Cover keyboard use, translated copy, loading, empty, failure, retry, permission, low-confidence, cleanup, and authorization states as applicable.
- Mock the network at the HTTP boundary and browser media/pose APIs at typed adapters. Never use real health data or camera recordings.
- Run the complete frontend commands shown under Testing and verification before reporting completion.

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
VITE_API_BASE_URL=/v1 corepack pnpm build

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
