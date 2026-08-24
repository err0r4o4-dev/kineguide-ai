---
name: diagnose-kineguide-system
description: Diagnose bugs, integration failures, health degradation, camera issues, and performance regressions across KineGuide AI web, Go, Python, PostgreSQL, Caddy, and CI. Use when something is failing, unavailable, incorrect, flaky, slow, or inconsistent across services.
---

# Diagnose KineGuide System

Build a deterministic feedback loop before proposing a fix.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/diagnostics.md`, recent changes, and the relevant service logs and tests.
2. Reproduce the user's exact symptom with the smallest reliable loop: test, HTTP probe, browser automation, service harness, or Compose health check.
3. Localize the failing layer using request IDs and dependency states:
   - browser rendering, environment, CORS, camera, or API client;
   - Go routing, validation, repository, PostgreSQL, or AI client;
   - Python schema, provider, configuration, or readiness;
   - proxy, container, volume, port, or CI environment.
4. Record three ranked, falsifiable hypotheses. Test one variable at a time.
5. Add temporary instrumentation only when needed; tag it uniquely and avoid sensitive values.
6. Convert the minimal reproduction into a regression test at the real failure seam.
7. Implement the smallest causal fix, rerun the original reproduction, and run affected full checks.
8. Remove instrumentation and temporary artifacts. Report cause, evidence, fix, and prevention.

## Diagnostic rules

Distinguish project failures from host failures such as Docker engine storage, unavailable ports, missing tools, or network restrictions. Never weaken readiness or tests to conceal a dependency failure. Never capture raw camera media or health information in fixtures, logs, screenshots, or traces.
