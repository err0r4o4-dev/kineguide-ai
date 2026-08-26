@AGENTS.md

Claude Code additions

AGENTS.md is authoritative. This file adds only Claude Code-specific task-state behavior; never duplicate repository rules here.

Task state

Start changes by checking git status --short --branch and existing root TODO.md.

Create a clearly named task section, or create TODO.md if absent. Preserve all unrelated content.

For large, cross-service, or multi-file work, keep Claude's plan synchronized with that section.

Work from its first unchecked item; check only successful work. Record failures/blockers under the relevant unchecked item.

After verification, remove only the completed section. Delete TODO.md only when Claude created it and nothing else remains.

Execution

Before editing an owned area, load the smallest matching repository skill and scoped rule required by AGENTS.md; never invent or substitute skills.

Re-read the final diff and verification results before reporting completion.
