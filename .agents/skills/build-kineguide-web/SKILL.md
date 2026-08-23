---
name: build-kineguide-web
description: Build and review KineGuide AI React, TypeScript, Tailwind, PWA, browser-camera, and pose UI behavior. Use for files under apps/web, frontend environment configuration, accessibility, localization, API clients, web tests, and client-side camera or pose processing.
---

# Build KineGuide Web

Build accessible, Thai-first features in `apps/web` while keeping medical and camera processing boundaries explicit.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/web.md`, and the feature folder being changed.
2. Keep feature-specific UI under `src/features`; promote a component to `packages/ui` only after proven reuse.
3. Add or update typed API functions in `src/services`; never call PostgreSQL or Python AI from the browser.
4. Use TanStack Query for server state and React Hook Form plus Zod for forms. Avoid new global state unless local/query state is insufficient.
5. Provide loading, empty, success, degraded, and failure states with accessible names and keyboard focus.
6. Add Thai copy first and an English translation key in the same change. Never hardcode user-facing strings in feature components.
7. Test observable behavior with Testing Library. Add Playwright coverage for critical browser flows when its runtime is available.
8. Run format, lint, type-check, unit tests, and production build.

## Camera and pose rules

- Process camera frames and MediaPipe inference in the browser.
- Never upload or log raw frames, images, or videos.
- Stop every `MediaStreamTrack` on navigation, cancellation, unmount, and error.
- Treat pose metrics as estimates; show calibration, confidence, and unavailable states without implying diagnosis.
- Keep worker protocols typed and versionable.

## Accessibility

Prefer semantic HTML, visible focus, sufficient contrast, descriptive errors, live regions for async status, and practical touch targets. Verify Thai text wrapping at narrow widths.
