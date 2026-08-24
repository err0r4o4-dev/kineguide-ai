---
trigger: model_decision
description: Apply to migrations, sqlc, repositories, PostgreSQL schema, indexes, seeds, or persisted data.
---

# Database rule

Use `$migrate-kineguide-database`.

- PostgreSQL belongs exclusively to the Go API.
- Use paired sequential up/down migrations, UUID keys, UTC `timestamptz`, explicit constraints, and justified indexes.
- Never edit an applied migration or run destructive data operations without authorization and rollback planning.
- Keep seeds deterministic, synthetic, and free of health information.
- Test migration directions on a disposable database when available.
