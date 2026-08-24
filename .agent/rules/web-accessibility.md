---
trigger: model_decision
description: Apply to every user-facing web change and especially forms, navigation, dialogs, async status, charts, camera flows, pose feedback, and touch interaction.
---

# Web accessibility rule

Use `$audit-kineguide-web` for accessibility-focused reviews.

- Start with semantic HTML and landmarks; use ARIA only to fill a real semantic gap.
- Maintain a logical heading hierarchy, descriptive page title, skip path to main content, and a visible focus indicator.
- Every control needs an accessible name, keyboard operation, clear focus order, and a practical touch target.
- Associate form labels, descriptions, required state, validation errors, and summaries programmatically.
- Announce asynchronous loading, success, degraded, and error changes without repeatedly interrupting assistive technology.
- Do not use color, icon shape, animation, sound, or camera overlay alone to communicate state.
- Give meaningful images useful alternative text and decorative images empty alternative text.
- Ensure dialogs trap focus, restore focus, close by documented keyboard behavior, and never hide an urgent safety path.
- Make charts and pose visuals expose an equivalent text summary. Avoid presenting uncertain pose metrics as precise clinical measurements.
- Verify keyboard-only use, 200% zoom, Thai wrapping, reduced motion, and narrow mobile layout for critical journeys.
