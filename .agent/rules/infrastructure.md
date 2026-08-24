---
trigger: model_decision
description: Apply to Dockerfiles, Compose, Caddy, CI, Makefile, health checks, environment templates, or infrastructure.
---

# Infrastructure rule

Use `$operate-kineguide-infrastructure`.

- Keep images minimal, non-root, health-checked, explicitly tagged, and free of secrets.
- Keep Python and PostgreSQL internal and ports configurable.
- Verify configuration, builds, startup, health, endpoint routing, migrations, logs, and shutdown in layers.
- Do not deploy, publish, prune shared state, or delete volumes without explicit authorization.
- Separate host Docker failures from repository defects.
