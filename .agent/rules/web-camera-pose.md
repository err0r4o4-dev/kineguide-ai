---
trigger: model_decision
description: Apply to browser camera permission, MediaStream, MediaPipe, landmarks, joint angles, repetition counting, workers, overlays, or pose feedback.
---

# Web camera and pose rule

Use `$build-kineguide-web`, `$protect-kineguide-data`, and `$review-kineguide-clinical-safety` when the behavior changes camera or pose safety.

- Request camera access only after explicit user action and applicable consent, with purpose explained before the browser prompt.
- Keep raw frames, images, video, and recordings in browser memory only. Never send, persist, log, screenshot, or commit them.
- Put browser APIs and MediaPipe behind typed adapters so lifecycle and failures can be tested deterministically.
- Stop all media tracks on cancellation, navigation, unmount, permission denial, device change, and unexpected failure.
- Cancel animation frames, timers, workers, observers, and model resources on every exit path.
- Bound inference frequency and separate frame processing from React rendering. Use a typed worker when measurement demonstrates sustained main-thread cost.
- Document coordinate systems, units, confidence gates, smoothing, orientation, mirroring, and required landmark sets.
- Treat landmarks, angles, and repetition counts as estimates. Provide calibration, low-confidence, multiple-person, missing-limb, and unsupported-device states.
- Never invent angle thresholds, exercise corrections, red flags, pain guidance, or progression rules. Require traceable sources and qualified review.
- Use synthetic landmark fixtures; never use patient media or identifiable recordings in tests.
