---
trigger: model_decision
description: Apply to frontend performance, bundle size, rendering, camera loops, workers, PWA caching, offline behavior, memory, or dependency additions.
---

# Web performance and PWA rule

Use `$audit-kineguide-web` for audits and `$diagnose-kineguide-system` for regressions.

- Measure a reproducible baseline before optimizing and state the metric that must improve.
- Keep high-frequency camera and pose updates outside broad React state. Avoid unnecessary context updates and unstable query keys.
- Lazy-load genuinely heavy route or model code, but do not fragment small modules or hide critical safety UI behind avoidable waterfalls.
- Clean up media tracks, workers, timers, observers, subscriptions, object URLs, and animation frames.
- Prefer transform and opacity for motion, respect reduced motion, and avoid long main-thread tasks.
- Preserve clear offline, stale, update-available, and failed-update states for the PWA.
- Do not cache authenticated health data or sensitive API responses without an explicit purpose, retention policy, and security review.
- Review dependency maintenance, license, bundle impact, browser support, and security before installation.
- Recheck interaction responsiveness, layout stability, startup, memory, and battery impact on realistic mobile constraints.
