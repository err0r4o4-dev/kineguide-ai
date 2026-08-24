---
name: test-kineguide-web
description: Build, repair, and review KineGuide AI frontend tests using Vitest, Testing Library, user-event, and Playwright. Use for test-first web features, regression tests, component and hook behavior, accessibility interactions, browser journeys, API mocking, camera or MediaPipe adapters, and frontend test infrastructure under apps/web.
---

# Test KineGuide Web

Verify user-observable React behavior through stable public seams and synthetic, privacy-safe fixtures.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/testing-quality.md`, `.agent/rules/web-testing.md`, the affected behavior, and nearby tests.
2. Define the exact user-visible pass/fail signal and choose the lowest test level that exercises the real seam.
3. For a behavior change or bug, write one failing test and confirm the failure is caused by the target behavior.
4. Implement only enough production code to pass, then repeat one vertical behavior at a time.
5. Refactor only while green and keep assertions independent of component internals.
6. Run the narrow test during iteration, then the affected frontend suite and production build.

## Test selection

- Use deterministic unit tests for schemas, geometry, reducers, state machines, and adapters.
- Use Testing Library with semantic queries and `userEvent` for component behavior, forms, keyboard use, asynchronous state, and translated copy.
- Use Playwright for critical route, permission, responsive, PWA, and multi-step browser journeys.
- Mock HTTP at the client boundary and browser APIs behind typed adapters. Preserve cancellation and timeout behavior.
- Use synthetic landmarks and fake media tracks. Never include raw camera recordings, patient data, tokens, or production payloads.

## Coverage expectations

Cover the relevant loading, empty, success, degraded, offline, validation, unauthorized, permission-denied, unsupported, low-confidence, retry, cancellation, unmount, and cleanup paths. Verify that media tracks, workers, timers, and subscriptions are released.

## Commands

Run `corepack pnpm --filter @kineguide/web format:check`, `lint`, `typecheck`, `test`, and `build` with `VITE_API_BASE_URL=/api/v1`. Run `test:e2e` when browser behavior changes and its runtime is available. Never weaken or skip a test to obtain a green result.
