---
trigger: model_decision
description: Apply to React, TypeScript, PWA, localization, accessibility, camera, pose, or files under apps/web.
---

# Web rule

Use `$build-kineguide-web` as the primary implementation skill. Add only the specialist skill whose trigger matches the task:

- `$design-kineguide-web` for new or redesigned UI;
- `$implement-kineguide-visual-reference` when a screenshot, mockup, or design reference is provided;
- `$test-kineguide-web` for test-first or test-focused work;
- `$audit-kineguide-web` for accessibility, responsive, UX, privacy, or performance review;
- `$diagnose-kineguide-system` for failures and regressions.

Read the matching detailed rules:

- `web-architecture.md` for folders, components, state, API boundaries, and forms;
- `web-design.md` for tokens, responsive layout, interaction, content, and localization;
- `web-accessibility.md` for semantics, keyboard, focus, announcements, and assistive technology;
- `web-camera-pose.md` for camera lifecycle, browser inference, uncertainty, and medical limits;
- `web-performance.md` for rendering, workers, PWA behavior, resource cleanup, and measurement;
- `web-testing.md` for Vitest, Testing Library, Playwright, mocks, and verification.

Never call Python or PostgreSQL from the browser. Never transmit raw camera media. Keep Thai first, add English in the same change, and verify every user-reachable state.
