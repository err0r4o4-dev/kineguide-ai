---
trigger: always_on
---

# KineGuide AI context

Read and follow the root `AGENTS.md` before modifying the repository.

KineGuide AI is a Thai-first physiotherapy support and educational prototype. It is not a diagnostic system. Preserve these boundaries:

- Browser → Go API → PostgreSQL or internal Python AI.
- PostgreSQL is accessed only by Go.
- Raw camera media stays in the browser.
- Python AI has no primary database access and makes no final clinical decisions.
- Public API behavior is synchronized with the OpenAPI contract.
- No secrets, health data, datasets, recordings, uploads, or model artifacts enter Git.

Use a repository-local skill from `.agents/skills/` whenever its description matches the task. Verify every claimed result.
