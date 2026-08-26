@AGENTS.md

# Claude Code Additions

`AGENTS.md` is imported above and is authoritative. This file defines only Claude Code-specific task-state and context behavior. On conflict, follow `AGENTS.md` and preserve the safer medical, privacy, security, and data-integrity boundary.

## Durable task state

- Use the named root `TODO.md` section required by `AGENTS.md` as the durable record for repository mutations. Preserve all unrelated content.
- For non-trivial, multi-file, or cross-service work, keep Claude's active plan synchronized with that section: the plan is the execution view; `TODO.md` is the resumable record.
- Work from the first unchecked item. Check only successful work and record failed commands or blockers under the relevant unchecked item.
- After context compaction, interruption, or resumption, re-read `TODO.md`, `git status --short --branch`, and the affected diff before continuing. Do not restart completed work or repeat verified checks without a reason.
- After successful verification, remove only the completed task section and delete `TODO.md` only when it is empty.

## Context discipline

- Follow the skill routing in `AGENTS.md`. Load only matching scoped rules and the smallest sufficient skill set; expand scope only when evidence shows another ownership boundary is affected.
- Treat `AGENTS.md`, selected rules, selected skills, affected code, nearby tests, and current contracts as the source of truth. Do not substitute remembered or duplicated repository guidance.
- Preserve user work and re-check the working tree after any external or concurrent change.

## Handoff

- Re-read the final diff and verification output before reporting completion.
- Lead with the outcome, list exact checks run, distinguish project failures from environment limits, and state remaining blockers or unverified behavior plainly.
