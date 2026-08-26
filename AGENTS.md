# KineGuide AI Agent Guide

Repository-wide rules for AI agents. Scoped rules and skills may add requirements but cannot weaken safety, privacy, architecture, or verification.

## Mission

Build a safe, explainable physiotherapy support and education prototype maintainable by a two-person university team. It must not diagnose or replace qualified healthcare professionals.

## Instruction priority

1. Current user request.
2. This `AGENTS.md`.
3. Matching `.agent/rules/`.
4. Matching `.agents/skills/`.
5. Existing contracts, tests, code, and docs.

On conflict, preserve medical safety, privacy, security, and data integrity; report the conflict.

## Before changing anything

1. Run `git status --short --branch`; preserve unrelated work.
2. Create root `TODO.md` with test-design, test, implementation, and verification items.
3. Work in checklist order; check items only after success.
4. Write a failing behavior test before production code when a reliable seam exists.
5. Run every affected check listed below.
6. Delete `TODO.md` only when all items pass. If blocked, keep it and note the failure under the unchecked item.

Never use destructive Git commands or delete completed-work tests.

## Test-first development

- Test features, fixes, refactors, APIs, configuration, databases, security, and user-visible behavior.
- Bugs require regression tests; cross-boundary changes require suitable unit and integration tests.
- APIs cover validation, success, errors, authentication, and authorization as applicable.
- UI tests cover reachable user states; clinical tests cover unavailable/low-confidence results, stop conditions, and escalation as applicable.
- Docs, comments, formatting, and static metadata need verification, not artificial unit tests.
- Never weaken tests or claim an unexecuted check passed.

## Non-negotiable architecture

```text
Browser / React PWA
  ├─ local camera + pose processing
  └─ REST/JSON → Go API
                  ├─ PostgreSQL
                  └─ internal REST/JSON → Python AI → LLM abstraction
```

- Browser calls only Go; Go exclusively owns primary PostgreSQL access.
- Python is internal, stateless by default, and has no primary DB credentials.
- Raw camera media stays in-browser; APIs receive approved derived metrics only.
- Caddy is the integrated entry point; direct ports are for development/diagnostics.
- `packages/contracts/openapi/kineguide-api.yaml` defines the public API.

Do not bypass these boundaries.

## Repository map and ownership

| Path | Owner |
| --- | --- |
| `apps/web` | React PWA, i18n, accessibility, camera/pose, browser tests |
| `services/api-go` | Public API, auth, orchestration, PostgreSQL, AI client |
| `services/ai-python` | Bounded AI processing and provider adapters |
| `packages/contracts` | Public OpenAPI source of truth |
| `packages/ui` | Proven cross-app UI primitives |
| `database` | Reversible migrations, synthetic seeds |
| `infrastructure` | Caddy, shared containers |
| `.github` | CI and collaboration workflows |
| `docs` | Architecture, API, DB, privacy, research, clinical references |
| `research` | Non-sensitive reproducible definitions; never datasets |

## Repository-local skills

Load only matching skills; read each selected `SKILL.md` fully.

| Skill | Trigger |
| --- | --- |
| `$develop-kineguide-feature` | Cross-service/end-to-end feature |
| `$build-kineguide-web` | React, PWA, camera/pose, a11y, i18n |
| `$design-kineguide-web` | New/redesigned UI |
| `$implement-kineguide-visual-reference` | Supplied visual → React |
| `$test-kineguide-web` | Frontend TDD/tests |
| `$audit-kineguide-web` | UX, a11y, responsive, privacy, performance audit |
| `$build-kineguide-go-api` | Go API, PostgreSQL, auth, AI client |
| `$build-kineguide-ai-service` | FastAPI, providers, bounded AI |
| `$evolve-kineguide-contracts` | API schemas/versioning |
| `$migrate-kineguide-database` | Migrations, sqlc, indexes, seeds |
| `$review-kineguide-clinical-safety` | Clinical or pose guidance |
| `$protect-kineguide-data` | Health data, secrets, auth, consent, retention |
| `$operate-kineguide-infrastructure` | Docker, Caddy, CI, health checks |
| `$diagnose-kineguide-system` | Bugs, regressions, integration, performance |

Web work starts with `$build-kineguide-web`; add at most one specialist unless an independent audit is needed. Diagnose broken behavior instead of redesigning it.

## Implementation principles

- Prefer the smallest complete solution; keep ownership, modules, and dependencies clear.
- Add interfaces only for real adapters, external seams, or deterministic tests.
- Validate trust boundaries; propagate cancellation and bounded I/O timeouts.
- Return actionable internal errors and safe, consistent external errors.
- Use structured logs with request IDs; never log secrets or sensitive payloads.
- Update affected docs/examples/env templates; add dependencies only when necessary.

## Web rules

### Frontend workflow

1. Read `.agent/rules/web.md` and matching `web-*.md`.
2. Inspect the route, feature, translations, API client, tests, and `packages/ui/DESIGN_TOKENS.md`.
3. Define journey, trust boundary, responsive targets, accessibility, and verification.
4. Extend existing patterns; implement a tested vertical slice when practical.
5. Verify narrowly, then run all frontend checks; add Playwright for critical journeys.

### Structure and ownership

- Use `src/routes`, `src/features/<feature>`, `src/components`, `src/hooks`, `src/lib`, and `src/services` according to their names.
- Co-locate feature code/tests; promote to `packages/ui` only after cross-surface reuse.
- Keep reusable state transitions, geometry, parsing, and validation outside presentation components.
- Never duplicate router, query client, i18n, HTTP client, styling, or form infrastructure.

### React, state, data, and forms

- Use strict TypeScript; avoid `any`, unjustified assertions, and duplicate API types.
- Use TanStack Query for server state, React Hook Form + Zod for forms, URLs for shareable state, and React state for local UI.
- Never copy query data into local state; keep keys stable, abortable, and auth-scoped.
- Add state libraries only for documented durable state shared by distant consumers.
- Use central Axios/env configuration; map backend validation accessibly and preserve recoverable form values.

### UI and responsive behavior

- Follow design tokens, semantic color, 4 px spacing, typography, and Lucide icons.
- Prefer semantic HTML/natural flow; effects must communicate hierarchy or state.
- Design from 320 px; verify 320/768/1024/1440 without overflow, obstruction, or hover-only actions.
- Implement reachable loading, empty, success, degraded, offline, denied, unsupported, failure, and retry states.
- Respect reduced motion; never delay safety information.

### Language and accessibility

- Default to Thai; add English in the same change; never hardcode feature copy.
- Provide landmarks, heading order, visible focus, labels, alt text, live regions, and practical targets.
- Never convey meaning only by color, icon, motion, or unexplained English abbreviations.
- Support Thai expansion and wrapping.

### Camera, pose, privacy, and safety

- Explain purpose and obtain explicit action/applicable consent before camera permission.
- Process frames/MediaPipe locally; never upload, persist, log, screenshot, or fixture raw media.
- Stop tracks on cancel, navigation, unmount, denial, device change, and error.
- Present pose metrics as estimates with honest unavailable/low-confidence states.
- Clinical thresholds, corrections, pain advice, diagnoses, and progression require a source and qualified review.

### Performance and PWA

- Keep pose loops outside React renders; bound inference; use typed workers only when measured need justifies them.
- Clean up timers, subscriptions, frames, observers, URLs, workers, and tracks.
- Preserve loading/update/offline clarity; never cache sensitive/authenticated health data without reviewed policy.
- Measure on realistic mobile hardware before optimizing.

### Frontend verification

- Test observable behavior with Testing Library + `userEvent`, not internals.
- Cover applicable keyboard, translation, async, permission, confidence, cleanup, and auth states.
- Mock HTTP and typed browser adapters; never use real health data/recordings.
- Run the frontend commands below.

## Go rules

- Keep `main` to config, wiring, lifecycle, shutdown; separate handlers/middleware, services, repositories, and `internal/client/ai`.
- Validate input; use standard JSON errors; wrap internal context without exposing SQL, credentials, URLs, or stacks.
- Use `context.Context` for DB/network work and prefer table tests, `httptest`, and deterministic adapters.
- Run Go format, vet, test, and build.

## Python AI rules

- Use strict Pydantic request, response, and provider-result schemas.
- Keep providers behind the protocol; preserve the deterministic disabled provider.
- Never add primary DB access or log health prompts/responses by default.
- LLMs cannot make final diagnostic, red-flag, exercise, dosage, or progression decisions.
- Require deterministic tests; run Ruff, mypy, pytest, and startup validation.

## API contract rules

- Change OpenAPI, implementation, typed clients, examples, and tests together.
- Prefer compatible additions; plan breaking changes explicitly.
- Document auth, validation, statuses, errors, nullability, units, and coordinates.
- Persist UUID strings and UTC RFC 3339 timestamps.
- Claim synchronization only after validation passes.

## Database rules

- Use sequential up/down migrations; never edit a migration applied outside disposable local development.
- Use UUID keys, `timestamptz`, explicit constraints, and query-justified indexes.
- Seeds are synthetic/non-medical; never store raw camera media, credentials, model artifacts, or needless provider content.
- Destructive operations need explicit authorization and rollback/backup plans.

## Healthcare safety

- Never invent diagnoses, red flags, protocols, joint thresholds, or treatment plans.
- Clinical rules require traceable sources and qualified review.
- Pose/LLM output is uncertain support, never final judgment.
- Report unavailable services honestly; never substitute confident synthetic output.
- Preserve consent, pain reporting, stop conditions, escalation, and accessibility.
- Ask the clinical owner when safety behavior is undefined.

## Privacy and security

- Minimize data; never commit `.env`, secrets, tokens, health data, datasets, recordings, uploads, or model artifacts.
- Keep secrets server-side; deny access by default and test unauthorized/forbidden/expired/invalid/deleted states.
- Define purpose, consent, retention, export, correction, and deletion before storing health data.
- Never claim regulatory compliance without evidence.

## Testing and verification

Run the narrowest useful check during development, then every affected command:

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

Use `go test -race ./...` when supported. For integration work, start Compose, verify health/readiness/docs/UI, then stop it. Separate host Docker failures from project failures.

## Git and collaboration

- Permanent branches: `main`, `develop`.
- Branch from `develop`: `feature/<issue>-<name>`, `fix/<issue>-<name>`, or `docs/<issue>-<name>`.
- Focus PRs into `develop`; promote verified releases to `main`.
- Use Conventional Commits and `Closes #<issue>`.
- Never push to `main`, force-push protected branches, invent remotes, change global Git config, or commit unrelated work.
- Commit only with user or governing-task authorization.

## Completion checklist

- Behavior, ownership, tests, and failure paths match the request.
- All affected checks pass; contracts, migrations, examples, and docs agree.
- No secret, sensitive/generated artifact, or unrelated change is staged.
- Report medical, privacy, security, accessibility, and operational implications.
- Stop temporary processes, debugging, and project containers.
- Complete all `TODO.md` items, then delete the file.
