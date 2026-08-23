---
name: operate-kineguide-infrastructure
description: Build, change, and verify KineGuide AI Dockerfiles, Compose services, Caddy routing, CI workflows, environment examples, health checks, migrations, and local developer commands. Use for docker-compose.yml, infrastructure, Dockerfiles, Makefile, or GitHub Actions.
---

# Operate KineGuide Infrastructure

Keep local and CI environments reproducible, health-gated, resource-conscious, and free of embedded secrets.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/infrastructure.md`, all affected Dockerfiles, and CI jobs.
2. Render configuration before starting services. Resolve ports, networks, volumes, environment flow, health checks, and dependency conditions.
3. Keep Python and PostgreSQL internal; expose the web, Go API, and Caddy only as documented.
4. Use multi-stage builds, non-root runtime users, explicit image tags, minimal contexts, and health checks available inside each image.
5. Keep credentials out of Compose, images, build arguments, logs, and GitHub workflow files.
6. Verify in layers: config render, image build, startup, container health, endpoint probes, migrations, frontend-to-Go path, logs, and graceful shutdown.
7. Stop only project-owned containers/processes. Report host-engine failures separately from project failures.
8. Keep CI aligned with local format, lint, type-check, test, build, OpenAPI, Compose, and forbidden-file checks.

## Change rules

Do not publish images, deploy, prune shared Docker state, delete volumes, or change external infrastructure without explicit authorization. Preserve configurable host ports and reasonable memory usage for student machines.
