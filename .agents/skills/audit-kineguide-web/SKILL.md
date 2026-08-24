---
name: audit-kineguide-web
description: Audit KineGuide AI web pages, components, and journeys for functional UX, accessibility, Thai and English localization, responsive layout, privacy, healthcare safety, PWA behavior, and measured performance. Use for frontend reviews, accessibility audits, responsive checks, UX sanity checks, performance reviews, or pre-release web quality assessment.
---

# Audit KineGuide Web

Review the complete user journey and report evidence-backed findings without silently changing implementation during a review-only request.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/web.md`, every matching `web-*.md` rule, the route, components, services, translations, and tests.
2. State the page goal, primary user, critical task, data sensitivity, and safety impact in one concise paragraph.
3. Trace the real path from route and interaction through query, HTTP client, Go API contract, rendered state, cleanup, and error handling.
4. Inspect or exercise every reachable state: loading, empty, success, degraded, offline, permission, validation, unauthorized, low-confidence, error, retry, and completion.
5. Verify semantic structure, headings, keyboard order, focus, names, descriptions, announcements, contrast, zoom, touch targets, reduced motion, and text alternatives.
6. Verify Thai default copy, English parity, wrapping, responsive behavior at 320, 768, 1024, and 1440 px, and absence of horizontal overflow.
7. Verify privacy and safety boundaries, especially raw-media handling, consent, resource cleanup, uncertain pose metrics, and non-diagnostic language.
8. Measure performance claims with a reproducible baseline. Check bundle impact, long tasks, render churn, layout stability, memory, and PWA caching policy as applicable.

## Reporting

Order findings by blocker, high, medium, then low. For each finding include the path or rendered state, evidence, user impact, and smallest recommended change. Distinguish verified defects from untested risks and note which checks were actually executed.

Close with a verdict: ready, ready with follow-up, fix before release, or rework. Do not implement fixes unless the user also requests changes.
