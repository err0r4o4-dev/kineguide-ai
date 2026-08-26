@AGENTS.md

## Claude Code-specific instructions

`AGENTS.md` is authoritative. These rules add Claude Code workflow guidance only. On conflict, follow `AGENTS.md` and preserve the safer medical, privacy, security, and data-integrity behavior.

### Working workflow

- Start each repository change with `git status --short --branch` and inspect root `TODO.md`.
- Before editing, create or extend a clearly scoped `TODO.md` task section. Preserve unrelated content.
- Order items as: investigation, verification/test design, tests when applicable, implementation, checks, cleanup.
- Work from the first unchecked item; check it only after success. Record blockers or failing commands under unchecked items.
- For large, cross-service, or multi-file work, keep Claude's plan synchronized with `TODO.md`.
- After verification, remove only the completed task section. Delete `TODO.md` only if Claude created it and no unrelated content remains. Never delete completed tests.
- Inspect affected code, nearby tests, established patterns, applicable `.agent/rules/`, and the smallest matching `.agents/skills/` skill before editing.
- Re-read the final diff, check for unintended or sensitive files, and run applicable `AGENTS.md` checks.
- Do not commit, push, rewrite history, or change Git configuration without explicit user authorization.

### Skill routing

- Follow the `AGENTS.md` skill table and web-skill limits; load only skills matching the task.
- Use `$develop-kineguide-feature` for cross-area slices, `$diagnose-kineguide-system` for failures, `$protect-kineguide-data` for sensitive/security work, and `$review-kineguide-clinical-safety` for clinical behavior or language.
- Never invent or substitute skills from another repository.

### Architecture and data boundaries

- Preserve `Browser / React PWA -> Go API -> PostgreSQL and/or internal Python AI`.
- Browser never calls PostgreSQL/Python directly; Python never receives primary DB credentials.
- Raw camera media stays in-browser; transmit only approved derived metrics.
- Keep OpenAPI, typed consumers, and ownership boundaries synchronized as defined in `AGENTS.md`.

### Implementation principles

- Reuse established libraries, components, clients, schemas, and test seams; implement the smallest complete solution.
- Avoid speculative abstractions, duplicate infrastructure, and unrelated cleanup.
- Add dependencies only when existing options are insufficient and document why.
- Apply validation, cancellation, bounded timeouts, and safe errors at the owning boundary.
- Do not access or modify secrets, `.env`, credentials, real health data, recordings, datasets, or model artifacts without explicit safe authorization.

### Technology guidance

- **Web:** Follow strict TypeScript, i18n, accessibility, state/form, centralized API-client, camera-cleanup, and responsive rules in `AGENTS.md`.
- **Go:** Keep lifecycle, handlers, services, repositories, middleware, and AI clients separated; use context, wrapped errors, and deterministic tests.
- **Python:** Use strict Pydantic/provider boundaries, remain stateless by default, preserve the disabled provider, and forbid final LLM clinical decisions.
- **Data/contracts:** Use reversible migrations, explicit constraints, synthetic seeds, UUID/UTC conventions, and synchronized contracts/tests.

### Safety, privacy, and accessibility

- Apply the healthcare, privacy, security, language, and accessibility rules in `AGENTS.md` without exception.
- Clinical rules require traceable sources and qualified review; never invent diagnoses, thresholds, protocols, treatments, dosage, or progression.
- Minimize sensitive data, deny access by default, avoid sensitive logs/caches, and preserve consent and data-right requirements.

### Verification

- Run narrow checks while developing, then every affected command in `AGENTS.md`; add proportional integration or browser checks where required.
- Never claim an unexecuted check passed. Distinguish project failures from unavailable tools, host limits, and sandbox restrictions.
