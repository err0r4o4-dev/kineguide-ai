---
trigger: model_decision
description: Apply when behavior is broken, failing, flaky, degraded, slow, or inconsistent across environments or services.
---

# Diagnostics rule

Use `$diagnose-kineguide-system`.

- Build a deterministic reproduction before fixing.
- Localize the failure using request IDs, readiness dependency states, tests, and narrow probes.
- Rank falsifiable hypotheses and change one variable at a time.
- Add a regression test at the real failure seam.
- Remove temporary instrumentation and fixtures, and never capture sensitive or raw camera data.
