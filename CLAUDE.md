@AGENTS.md

## Claude Code-specific instructions

You are working on KineGuide AI, a Thai-first physiotherapy support and educational prototype built as a React PWA, Go API, internal Python AI service, and PostgreSQL-backed monorepo.

`AGENTS.md` is the authoritative source of repository-wide instructions. This section only adds Claude Code workflow guidance. If anything here conflicts with `AGENTS.md`, follow `AGENTS.md` and preserve the safer medical, privacy, security, and data-integrity behavior.

### Working workflow

- At the start of every repository change, inspect `git status --short --branch` and check for an existing root `TODO.md`.
- Before editing project files, create or safely extend `TODO.md` with a clearly scoped checklist for the current task. Preserve all pre-existing or unrelated checklist content.
- List investigation, test or verification design, test implementation when applicable, production implementation, relevant checks, and cleanup in execution order.
- For features, bug fixes, refactors, and behavior changes, place tests before production code and first confirm the new or failing behavior at the real seam when practical. Do not invent unit tests for documentation-only or metadata-only edits; include a proportional verification item instead.
- Read `TODO.md`, complete the first unchecked item in the current task section, mark it `- [x]`, save the file, and repeat until all items are complete.
- After successful verification, remove the completed temporary task section. Delete `TODO.md` only when Claude created it for this task and it contains no pre-existing or unrelated work. Never delete completed tests.
- If blocked or a check fails, leave the relevant item unchecked and record the concise blocker or failing command in `TODO.md`.
- Inspect the affected files, nearby tests, and existing patterns. Preserve unrelated user changes.
- Read the applicable rules under `.agent/rules/` and load the smallest matching repository skill from `.agents/skills/` before changing an owned area.
- For large features, cross-service changes, or multi-file refactors, keep Claude Code's planning or task-tracking state synchronized with `TODO.md`.
- For bug fixes and observable behavior changes, define the verification signal first and prefer a failing test at the real failure seam when practical.
- Implement the smallest complete solution. Avoid speculative abstractions, parallel frameworks, duplicate clients, or broad cleanup unrelated to the request.
- Re-read the final diff, check for unintended files or sensitive data, and run the relevant verification commands from `AGENTS.md` before reporting completion.
- Do not commit, push, force-push, change Git configuration, or alter branch history unless the user explicitly requests it.

### Skill routing

- Use `$build-kineguide-web` for React, TypeScript, PWA, browser camera, pose, accessibility, localization, and other `apps/web` implementation work.
- Add `$design-kineguide-web` for a new or redesigned interface, `$test-kineguide-web` for test-focused frontend work, or `$audit-kineguide-web` for an independent web quality review. Follow the web-skill limits in `AGENTS.md`.
- Use `$develop-kineguide-feature` when a vertical slice spans more than one service or repository area.
- Use `$build-kineguide-go-api` for Go API behavior and `$build-kineguide-ai-service` for the internal Python AI service.
- Use `$evolve-kineguide-contracts`, `$migrate-kineguide-database`, or `$operate-kineguide-infrastructure` when the change is owned by contracts, persistence, or infrastructure respectively.
- Use `$diagnose-kineguide-system` for failures and regressions, `$protect-kineguide-data` for sensitive-data or security work, and `$review-kineguide-clinical-safety` for health-language or clinical-behavior changes.
- Load only skills that match the task. Do not invent or substitute skills from another repository.

### Architecture and data boundaries

- Keep the request path `Browser / React PWA -> Go Main API -> PostgreSQL and/or internal Python AI Service`.
- The browser must not call PostgreSQL or the Python service directly. The Python service must not receive primary database credentials.
- Raw camera frames, images, and videos stay in the browser. Send only explicitly approved derived metrics across API boundaries.
- Keep public API behavior synchronized with `packages/contracts/openapi/kineguide-api.yaml` and typed consumers.
- Preserve clear ownership: web UI in `apps/web`, public API and database orchestration in `services/api-go`, bounded AI processing in `services/ai-python`, and shared contracts in `packages/contracts`.

### Implementation principles

- Match the established code style and use existing libraries, components, clients, schemas, and test seams before creating new ones.
- Keep functions and modules focused, dependencies explicit, and trust-boundary validation close to the owning service.
- Add a dependency only when the standard library and existing project dependencies are insufficient, and document the reason.
- Carry cancellation and bounded timeouts through database, network, camera, pose, worker, and provider operations as applicable.
- Return actionable internal errors and safe external errors. Never expose stack traces, SQL details, credentials, internal URLs, prompts containing health data, or provider responses.
- Do not modify secrets, tokens, credentials, `.env` files, real health information, recordings, datasets, or model artifacts unless the user explicitly authorizes a necessary and safe operation.

### Technology guidance

- React and TypeScript: keep strict typing, accessible semantic HTML, Thai and English translations together, server state in TanStack Query, forms in React Hook Form with Zod, and Go API calls in the centralized client.
- Camera and pose: request permission only after explicit user action, process media locally, represent uncertainty honestly, and clean up every track, timer, frame, worker, and subscription on all exit paths.
- Go: keep `main` focused on wiring and lifecycle; separate handlers, services, repositories, middleware, and AI clients; use `context.Context`, wrapped errors, table-driven tests, and the standard JSON error envelope.
- Python: use strict Pydantic schemas and provider abstractions, remain stateless by default, preserve the disabled deterministic provider, and never delegate final clinical decisions to an LLM.
- Database and contracts: use reversible migrations, explicit constraints, UUIDs and UTC timestamps, synthetic non-medical seeds, and synchronized OpenAPI, implementation, examples, clients, and tests.

### Safety, privacy, and accessibility

- KineGuide AI supports education and physiotherapy workflows; it does not diagnose or replace a qualified healthcare professional.
- Never invent diagnoses, red-flag criteria, exercise protocols, treatment plans, dosage, progression rules, or pose thresholds. Require a traceable clinical source and qualified reviewer.
- Minimize sensitive data, deny access by default, avoid sensitive logs and caches, and preserve consent, retention, export, correction, and deletion requirements.
- Default user-facing content to Thai and provide English in the same change. Maintain keyboard access, visible focus, semantic structure, screen-reader feedback, practical touch targets, and non-color-only status cues.

### Verification

- Run the narrowest useful checks while developing, then all checks relevant to the affected area as listed in `AGENTS.md`.
- Web changes normally require format checking, lint, type-check, unit tests, and a production build; critical browser journeys may also require Playwright.
- Go changes normally require `go fmt`, `go vet`, `go test`, and `go build`; use the race detector when supported and relevant.
- Python changes normally require Ruff lint and format checks, mypy, pytest, and startup validation.
- Infrastructure or integrated changes require configuration validation and proportional health/readiness checks.
- Never claim a check passed unless the command completed successfully. Clearly distinguish project failures from unavailable tools, host limitations, or sandbox restrictions.
