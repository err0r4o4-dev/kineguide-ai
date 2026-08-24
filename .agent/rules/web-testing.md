---
trigger: model_decision
description: Apply to frontend behavior changes, bug fixes, refactors, Vitest, Testing Library, Playwright, camera mocks, API mocks, or web test infrastructure.
---

# Web testing rule

Use `$test-kineguide-web`.

- Define one observable pass/fail behavior and prefer a red-green-refactor vertical slice.
- Use Testing Library queries that reflect how users and assistive technology find elements. Prefer `userEvent` over low-level event dispatch.
- Test outcomes, state transitions, cleanup, and accessible messages rather than hook calls, private functions, or DOM implementation trivia.
- Mock at real boundaries: HTTP client adapter, time, browser permission, MediaStream, MediaPipe, worker, and storage.
- Cover loading, empty, success, degraded, failure, retry, cancellation, unauthorized, permission-denied, low-confidence, and cleanup states when applicable.
- Keep fixtures synthetic and free of health information, raw media, tokens, or production payloads.
- Add Playwright coverage for critical multi-step browser journeys; keep unit tests for deterministic feature logic and components.
- Never weaken, skip, delete, or over-mock a test merely to make the suite pass.
- Run format, lint, type-check, unit tests, and production build; run relevant Playwright tests when browser behavior changes.
