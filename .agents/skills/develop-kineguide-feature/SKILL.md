---
name: develop-kineguide-feature
description: Deliver focused KineGuide AI features as safe vertical slices across web, Go, Python, contracts, database, and infrastructure. Use for new product behavior, cross-service changes, or issue implementation that spans more than one monorepo area.
---

# Develop KineGuide Feature

Deliver the smallest complete behavior that can be independently reviewed, tested, and demonstrated.

## Workflow

1. Read `AGENTS.md`, the matching files in `.agent/rules/`, and the affected package documentation.
2. Restate the user-visible outcome, affected services, data sensitivity, and medical-safety impact.
3. Trace the current path from UI to Go, Python, contract, and database. Do not add a layer that the behavior does not need.
4. Define verification before implementation. Add a failing test first for bug fixes and behavior changes when a reliable seam exists.
5. Implement one thin vertical slice. Preserve service ownership: the web calls Go, Go owns PostgreSQL, and Go alone calls Python.
6. Update OpenAPI, migrations, environment examples, and documentation whenever the change alters those contracts.
7. Run the narrow checks while iterating, then the full checks for every affected workspace.
8. Report what changed, evidence, privacy or clinical implications, and remaining limitations.

## Guardrails

- Do not invent clinical rules, diagnoses, red-flag decisions, exercises, or treatment plans.
- Do not transmit or persist raw camera media.
- Do not expose Python AI or PostgreSQL directly to the browser.
- Do not create speculative repositories, services, interfaces, or shared components.
- Do not weaken an existing test or security control merely to make a change pass.
- Stop for explicit direction when clinical ownership, consent, retention, or destructive migration behavior is unresolved.

Use the specialized KineGuide skill for each affected area instead of repeating its detailed rules here.
