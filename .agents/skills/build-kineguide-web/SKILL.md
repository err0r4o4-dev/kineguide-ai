---
name: build-kineguide-web
description: Build and review KineGuide AI React, TypeScript, Tailwind, and PWA features under apps/web, including routing, components, TanStack Query, React Hook Form and Zod, localization, accessibility, public Go API clients, browser camera lifecycle, MediaPipe pose processing, frontend tests, and production builds. Use for any implementation change owned by the web application.
---

# Build KineGuide Web

Deliver accessible, Thai-first vertical slices in `apps/web` while preserving the Go API boundary, browser-only raw camera processing, and clinically safe uncertainty.

## Rule and skill routing

1. Read `AGENTS.md`, `.agent/rules/web.md`, every matching `web-*.md` rule, the affected route or feature, translations, services, and nearby tests.
2. Add `$design-kineguide-web` for new or redesigned UI.
3. Add `$implement-kineguide-visual-reference` only when a real screenshot, mockup, Figma design, or approved reference is supplied.
4. Add `$test-kineguide-web` for test-first or test-focused work.
5. Use `$audit-kineguide-web` for review requests and `$diagnose-kineguide-system` for failures or regressions.
6. Add `$protect-kineguide-data` and `$review-kineguide-clinical-safety` whenever camera, pose, health, consent, pain, safety, or clinical language changes.

## Implementation workflow

1. Define the user-visible outcome, Thai and English copy, reachable states, API contract, data sensitivity, safety impact, and deterministic verification signal.
2. Keep route composition in `src/routes`, domain behavior in `src/features/<feature>`, shared application UI in `src/components`, reusable hooks in `src/hooks`, infrastructure helpers in `src/lib`, and Go API calls in `src/services`.
3. Reuse the established router, Query client, Axios client, i18n instance, Tailwind setup, Lucide icons, and semantic design direction.
4. Use TanStack Query for server state, React Hook Form with Zod for forms, URL state for shareable navigation, and local React state for local interaction.
5. Implement one vertical behavior at a time with an observable test. Avoid speculative abstractions and dependencies.
6. Provide loading, empty, success, degraded, offline, permission, validation, low-confidence, retry, and failure states when reachable.
7. Verify keyboard, focus, announcements, touch targets, reduced motion, Thai wrapping, and layouts at representative mobile through desktop widths.
8. Run format, lint, type-check, unit tests, production build, and relevant Playwright journeys.

## Camera and pose boundaries

- Request camera access only after explicit action and applicable consent.
- Keep raw frames, images, and videos in browser memory. Never upload, persist, log, screenshot, or commit them.
- Put MediaStream and MediaPipe behind typed adapters and keep sustained frame processing out of broad React render paths.
- Stop tracks and dispose workers, timers, animation frames, observers, and model resources on every exit path.
- Treat pose metrics as estimates and surface calibration, confidence, unsupported, and unavailable states.
- Never invent clinical thresholds, exercise corrections, diagnoses, red flags, pain advice, or progression logic.

## Completion

Report changed behavior, affected routes and contracts, tests actually executed, responsive and accessibility evidence, resource cleanup, and remaining privacy or clinical limitations. Never claim success from a check that did not complete.
