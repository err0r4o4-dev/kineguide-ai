KineGuide AI Agent Guide

Repository-wide rules for AI coding agents. Scoped rules and skills may add requirements but never weaken safety, privacy, architecture, or verification.

Mission and safety

Build a safe, explainable physiotherapy support and education prototype for a two-person university team. It must not diagnose or replace qualified clinicians.

Never invent diagnoses, red flags, protocols, treatments, dosage, progression, or pose thresholds. Clinical rules require traceable sources and qualified review.

Treat pose and LLM output as uncertain support. Preserve consent, pain/stop conditions, escalation, and honest unavailable/low-confidence states.

Minimize data. Never commit secrets, .env, health data, datasets, recordings, uploads, or model artifacts. Define purpose, consent, retention, and data rights before storing health data.

Priority and routing

Follow: current request → AGENTS.md → matching .agent/rules/ → matching .agents/skills/ → contracts/tests/code/docs. Resolve conflicts toward safety, privacy, security, and data integrity; report them.

Before editing, read only affected code, nearby tests, matching scoped rules, and the smallest matching skill. Read selected SKILL.md files fully. Web work starts with $build-kineguide-web; cross-area work uses $develop-kineguide-feature; failures use $diagnose-kineguide-system. Add at most one web specialist unless an independent audit is required.

Workflow

Run git status --short --branch; preserve unrelated work.

Create or extend root TODO.md with investigation, tests, implementation, verification, and cleanup. Preserve unrelated sections.

Work from the first unchecked item. For behavior changes, write a failing test first when practical; bugs require regression tests and boundary changes require integration coverage.

Implement the smallest complete change. Check items only after successful work.

Run affected checks, inspect the final diff, and remove only your completed TODO section. Delete TODO.md only if empty; record blockers under unchecked items.

Never weaken/delete tests, use destructive Git commands, or claim unexecuted checks passed.

Architecture and ownership

React PWA (local camera/pose) → Go API → PostgreSQL
                                └→ internal Python AI → LLM adapter

Browser calls only Go; Go alone owns primary PostgreSQL access; Python is internal/stateless without primary DB credentials.

Raw camera media stays in-browser; APIs receive approved derived metrics only.

apps/web owns web; services/api-go API/DB orchestration; services/ai-python bounded AI; packages/contracts public OpenAPI; other top-level paths retain their named ownership.

Keep public behavior synchronized with packages/contracts/openapi/kineguide-api.yaml. Do not bypass boundaries.

Engineering rules

Reuse established components, clients, schemas, libraries, and test seams; never create parallel infrastructure without a demonstrated need.

Validate trust boundaries; propagate cancellation and bounded I/O timeouts; return safe external errors and use structured, non-sensitive logs.

Add dependencies only when existing options are insufficient. Update affected contracts, migrations, examples, docs, and environment templates.

Use reversible migrations, UUIDs, UTC timestamps, explicit constraints, justified indexes, and synthetic non-medical seeds. Destructive data work requires authorization and rollback/backup.

Web and services

Web: read matching web-*.md and packages/ui/DESIGN_TOKENS.md; use strict TypeScript, central API/i18n/state/form patterns, semantic accessible UI, Thai-default plus English, responsive states, and reduced motion.

Camera/pose: explain before permission, process locally, clean every track/resource on all exits, and expose uncertainty honestly.

Go: keep main to wiring/lifecycle; separate handlers, services, repositories, middleware, and AI clients; use context.Context, standard JSON errors, table tests, and httptest.

Python: use strict Pydantic schemas/provider boundaries, preserve the deterministic disabled provider, remain stateless, and never delegate final clinical decisions to an LLM.

APIs: update OpenAPI, implementation, typed clients, examples, and tests together; document auth, errors, nullability, units, and coordinate systems.

Verification

Run narrow checks while developing, then every affected group:

# Web
corepack pnpm format:check && corepack pnpm lint
corepack pnpm typecheck && corepack pnpm test
VITE_API_BASE_URL=/v1 corepack pnpm build

# Go
cd services/api-go
go fmt ./... && go vet ./... && go test ./...
go build ./cmd/server

# Python
cd services/ai-python
uv run ruff check . && uv run ruff format --check .
uv run mypy app && uv run pytest

# Infrastructure
docker compose config

Use go test -race ./... when supported. For integration changes, start Compose, verify health/readiness/docs/UI, then stop it. Distinguish project failures from host/tool limits.

Git and completion

Branch from develop as feature|fix|docs/<issue>-<name>; PR to develop; promote verified releases to main.

Use Conventional Commits and Closes #<issue>. Never push directly to main, force-push protected branches, alter Git config/remotes, or commit without authorization.

Finish only when requested behavior, tests, affected checks, contracts/docs, safety implications, cleanup, and TODO removal are complete and no sensitive/unrelated file is staged.
