---
trigger: model_decision
description: Apply to commits, branches, pull requests, issues, releases, remotes, or repository maintenance.
---

# Git workflow rule

- Preserve unrelated changes and inspect status before staging.
- Branch from `develop` using `feature/<issue>-<name>`, `fix/<issue>-<name>`, or `docs/<issue>-<name>`.
- Use focused Conventional Commits and pull requests into `develop`.
- Never push directly to `main`, invent a remote, modify global Git configuration, or run destructive Git commands.
- Scan staged files for secrets, sensitive data, generated artifacts, and unrelated changes.
