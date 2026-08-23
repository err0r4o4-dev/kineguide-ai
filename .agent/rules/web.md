---
trigger: model_decision
description: Apply to React, TypeScript, PWA, localization, accessibility, camera, pose, or files under apps/web.
---

# Web rule

Use `$build-kineguide-web`.

- Keep Thai as the default and add English translations with every user-facing string.
- Use typed Go API clients and TanStack Query; never call Python or PostgreSQL directly.
- Provide accessible loading, empty, success, degraded, and error states.
- Keep raw camera frames in-browser and stop all media tracks on every exit path.
- Add behavior-focused tests and run format, lint, type-check, unit tests, and build.
