---
description: Review a KineGuide interface for visual consistency, accessibility, responsive behavior, privacy, safety, and performance.
---

# Web design review workflow

1. State the page goal and primary user journey.
2. Inspect the rendered states and trace each interaction to the owning component and service.
3. Review hierarchy, tokens, Thai and English copy, responsive layout, keyboard flow, focus, announcements, contrast, touch targets, and reduced motion.
4. Review loading, empty, degraded, offline, permission, error, retry, and safety states.
5. For camera or pose UI, verify consent, track cleanup, low-confidence behavior, no raw-media transfer, and non-diagnostic language.
6. Measure performance claims instead of inferring them from code shape.
7. Report findings by severity with path, evidence, user impact, and the smallest recommended change.
8. Run affected automated checks only when the review scope authorizes execution; do not silently implement fixes during a review-only request.
