# KineGuide AI Agent Guide

Authoritative repository-wide instructions for AI coding agents. Scoped rules and repository skills refine this guide but must not weaken safety, privacy, architecture, or verification.

## Mission and product boundary

Build a safe, explainable, Thai-first physiotherapy support and education prototype that a two-person university team can maintain.

KineGuide AI does not diagnose, prescribe, or replace a physician, physiotherapist, or other qualified clinician. Treat pose estimates and LLM output as uncertain support, never final clinical judgment.

Never invent diagnoses, red flags, exercise protocols, treatment, dosage, progression, or pose thresholds. Every clinical rule requires a traceable source and qualified review.

## Instruction order

Follow, in order:

1. The current user request.
2. This `AGENTS.md`.
3. Every matching `.agent/rules/*.md` rule.
4. The smallest matching `.agents/skills/*/SKILL.md` skill set.
5. Existing contracts, tests, code, and documentation.

Resolve conflicts toward medical safety, privacy, security, and data integrity, and report the conflict. Do not invent a rule or substitute a similar skill when ownership is unclear.

## Efficient task workflow

Before any repository mutation:

1. Run `git status --short --branch` and preserve unrelated work.
2. Scope the affected ownership area; inspect only relevant code, nearby tests, contracts, and documentation.
3. Read every matching scoped rule and each selected `SKILL.md` fully. Do not load unrelated skills.
4. Create or extend a clearly named section in root `TODO.md` covering investigation, tests, implementation, verification, and cleanup. Preserve unrelated sections.
5. Define the observable pass/fail signal. For bugs and behavior changes, write a failing regression test first when a reliable seam exists.

During work:

- Work from the first unchecked TODO item and check it only after successful work.
- Implement the smallest complete vertical slice; reuse established components, clients, schemas, libraries, and test seams.
- Run narrow checks while iterating. Add boundary or integration coverage when behavior crosses services.
- Record blockers and failed commands under the relevant unchecked item.
- Never delete, skip, weaken, or over-mock tests to obtain a pass.

Before completion:

- Run every affected verification group, inspect the final diff, and report only checks that actually completed.
- Remove only the completed task's TODO section. Delete `TODO.md` only when it is empty.
- Stop temporary processes and project containers started for the task.

## Skill routing

Use one primary skill whenever possible; add a specialist only when its trigger is genuinely present.

| Work | Primary skill | Add when needed |
| --- | --- | --- |
| Cross-service feature | `$develop-kineguide-feature` | Area-specific skill for the changed boundary |
| Bug, regression, outage, slowness | `$diagnose-kineguide-system` | Owning implementation skill after diagnosis |
| React/PWA work | `$build-kineguide-web` | `$design-kineguide-web`, `$test-kineguide-web`, or `$audit-kineguide-web` |
| Supplied screenshot/mockup/Figma | `$implement-kineguide-visual-reference` | Only when a real approved reference exists |
| Go API | `$build-kineguide-go-api` | `$evolve-kineguide-contracts` or `$migrate-kineguide-database` |
| Python AI service | `$build-kineguide-ai-service` | `$review-kineguide-clinical-safety` for clinical behavior |
| Public HTTP contract | `$evolve-kineguide-contracts` | Every affected producer and consumer skill |
| PostgreSQL persistence | `$migrate-kineguide-database` | Go API skill for repository behavior |
| Docker, Caddy, CI, environment | `$operate-kineguide-infrastructure` | Owning service skill when runtime behavior changes |
| Auth, consent, health data, secrets | `$protect-kineguide-data` | Required alongside the owning implementation skill |
| Symptoms, pain, exercise, pose feedback | `$review-kineguide-clinical-safety` | Required alongside the owning implementation skill |

Web work starts with `$build-kineguide-web`. Add at most one web specialist unless an independent audit is explicitly required. Diagnose broken behavior before considering redesign.

## Non-negotiable architecture

```text
Browser / React PWA
  ├─ local camera + pose processing
  └─ REST/JSON → Go API → PostgreSQL
                  └─ internal REST/JSON → Python AI → LLM adapter
```

- The browser calls only the public Go API.
- Go alone owns primary PostgreSQL access and application orchestration.
- Python AI is internal and stateless, has no primary database credentials, and cannot make final clinical decisions.
- Raw camera media stays in-browser. APIs receive only explicitly approved derived metrics.
- Caddy is the integrated entry point; direct service ports are for development and diagnostics.
- `packages/contracts/openapi/kineguide-api.yaml` is the public API source of truth.

Ownership follows directory boundaries: `apps/web`, `services/api-go`, `services/ai-python`, `packages/contracts`, `packages/ui`, `database`, `infrastructure`, `.github`, `docs`, and `research`. Do not bypass an owner or create parallel infrastructure without demonstrated need.

## Engineering gates

- Validate input at trust boundaries; keep invariants with the owning domain.
- Propagate cancellation and bounded timeouts through database, network, provider, and long-running browser work.
- Return actionable internal errors and safe, consistent external errors. Use structured logs with request IDs; never log secrets or sensitive payloads.
- Add dependencies only when existing options are insufficient. Update affected contracts, examples, environment templates, and documentation in the same change.
- Public API changes update OpenAPI, Go implementation, typed web clients, examples, and tests together. Document auth, validation, statuses, errors, nullability, units, and coordinate systems.
- Database changes use reversible sequential migrations, UUID keys, UTC timestamps, explicit constraints, query-justified indexes, and synthetic non-medical seeds. Destructive data work requires explicit authorization and a rollback or backup plan.

### Web gates

- Read `.agent/rules/web.md`, every matching `web-*.md`, and `packages/ui/DESIGN_TOKENS.md` before editing `apps/web`.
- Use strict TypeScript and the central router, TanStack Query, Axios/env, i18n, React Hook Form/Zod, and styling patterns. Do not introduce duplicate infrastructure.
- Thai is the default; add English in the same change and never hardcode feature copy.
- Use semantic, accessible UI with visible focus, practical targets, reduced motion, and reachable loading, empty, degraded, offline, denied, unsupported, failure, and retry states.
- Design from 320 px and verify at 320, 768, 1024, and 1440 px without overflow, obstruction, or hover-only actions.
- Explain camera purpose before permission. Process media locally and release every track, frame, timer, worker, observer, subscription, and object URL on every exit path.
- Present pose results with honest unavailable and low-confidence states. Never cache authenticated or sensitive health data without an explicit reviewed policy.

### Go and Python gates

- Go `main` owns only configuration, wiring, lifecycle, and shutdown. Keep HTTP, service, repository, middleware, and AI-client concerns separated; use `context.Context`, standard JSON errors, table tests, and `httptest`.
- Python uses strict Pydantic boundary schemas and provider adapters. Preserve the deterministic disabled provider, remain stateless, and never log health prompts or provider responses by default.
- Neither an LLM nor low-confidence/unavailable pose output may be converted into confident synthetic clinical guidance.

## Privacy and healthcare safety gates

- Minimize data before securing it. Never commit secrets, `.env`, health data, datasets, recordings, uploads, or model artifacts.
- Define purpose, consent, retention, export, correction, and deletion before storing health data.
- Keep secrets server-side and deny access by default. Test unauthorized, forbidden, expired, invalid, and deleted states where applicable.
- Preserve consent, pain reporting, stop conditions, escalation, accessibility, and honest unavailable-service behavior.
- Stop and request a clinical-owner decision when safety behavior is undefined. Never claim regulatory compliance without evidence.

## Verification matrix

Run narrow checks during development, then each affected group below.

### Web

```bash
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
VITE_API_BASE_URL=/v1 corepack pnpm build
```

Run `corepack pnpm --filter @kineguide/web test:e2e` for critical browser journeys.

### Go

```bash
cd services/api-go
go fmt ./...
go vet ./...
go test ./...
go build ./cmd/server
```

Use `go test -race ./...` when the host supports it.

### Python

```bash
cd services/ai-python
uv run ruff check .
uv run ruff format --check .
uv run mypy app
uv run pytest
```

### Contracts and infrastructure

```bash
corepack pnpm openapi:lint
docker compose config
```

For integrated changes, start Compose, verify health, readiness, docs, and UI behavior, then stop it. A successful `docker compose config` does not prove runtime health. Distinguish project failures from host or tool limitations.

For documentation-only changes, validate references, commands, Markdown structure, and `git diff --check`; do not create artificial tests.

## Git and completion

- Branch from `develop` as `feature/<issue>-<name>`, `fix/<issue>-<name>`, or `docs/<issue>-<name>` and open focused PRs into `develop`.
- Use Conventional Commits and `Closes #<issue>` when applicable.
- Never push directly to `main`, force-push protected branches, invent remotes, alter Git configuration, stage unrelated work, or use destructive Git commands.
- Do not commit without explicit user or governing-task authorization.

Finish only when requested behavior and failure paths are covered, affected checks pass, contracts and docs agree, safety/privacy implications are reported, cleanup is complete, and no secret, sensitive/generated artifact, or unrelated file is staged.
