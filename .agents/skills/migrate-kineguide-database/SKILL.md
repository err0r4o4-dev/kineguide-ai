---
name: migrate-kineguide-database
description: Design and verify KineGuide AI PostgreSQL migrations, sqlc queries, repositories, and synthetic seeds. Use for files under database, services/api-go/db, persisted entities, indexes, constraints, retention fields, or data backfills.
---

# Migrate KineGuide Database

Make PostgreSQL changes explicit, reversible when practical, privacy-aware, and owned by the Go API.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/database.md`, and `docs/database-design.md`.
2. Classify each field: purpose, sensitivity, consent basis, retention, deletion behavior, and audit need.
3. Create a sequential paired `.up.sql` and `.down.sql` migration. Explain any intentionally irreversible operation before execution.
4. Use UUID primary keys, `timestamptz` UTC timestamps, explicit foreign keys, useful constraints, and indexes justified by a query.
5. Add sqlc queries only for current behavior; generate or update typed Go access without hand-editing generated output.
6. Keep seeds deterministic, synthetic, and free of realistic patient information.
7. Test migration up/down on a disposable database and run Go repository/integration checks.

## Safety rules

- Never edit an applied migration; add a new migration.
- Never use destructive schema or data operations without exact target verification, backup/rollback planning, and user authorization.
- Never store raw camera images or videos, credentials, provider secrets, or unnecessary prompt content.
- Never grant database access to the web or Python AI service.
- Avoid healthcare tables until their domain, privacy, and clinical ownership are approved.
