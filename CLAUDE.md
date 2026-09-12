@AGENTS.md

# Claude Code Additions

`AGENTS.md` is imported above and is authoritative. This file defines only Claude Code-specific task-state, context, and execution behavior.

If anything here conflicts with `AGENTS.md`, follow `AGENTS.md` and preserve the safer privacy, security, posture-safety, accessibility, and data-integrity boundary.

## Durable task state

- Use the named root `TODO.md` section required by `AGENTS.md` as the durable record for repository mutations. Preserve all unrelated content.
- For non-trivial, multi-file, or cross-service work, keep Claude's active plan synchronized with that section: the active plan is the current execution view; `TODO.md` is the resumable repository state.
- Work from the first unchecked item.
- Check an item only after the corresponding work and required verification succeed.
- Record failed commands, unresolved findings, environment limitations, or blockers under the relevant unchecked item.
- After context compaction, interruption, handoff, or resumption:
  1. re-read the relevant `TODO.md` section;
  2. run `git status --short --branch`;
  3. inspect the affected diff;
  4. re-read affected contracts or documentation when behavior changed.
- Do not restart completed work or repeat previously successful checks without a concrete reason.
- After successful implementation and verification, remove only the completed task section.
- Delete `TODO.md` only when no unrelated task sections remain.

## Context discipline

- Follow the skill routing defined by `AGENTS.md`.
- Load only matching scoped rules, the smallest sufficient skill set, affected implementation files, nearby tests, affected contracts, and relevant documentation.
- Expand scope only when evidence shows another ownership boundary is affected.
- Treat the current user request, `AGENTS.md`, selected rules, selected skills, current contracts, tests, implementation, and documentation as the source of truth.
- Do not substitute remembered or duplicated repository guidance for current files.
- Preserve user work and unrelated changes.
- Re-check the working tree after external, concurrent, generated, or tool-driven changes.

## Product boundary awareness

KineGuide AI is a real-time posture-monitoring and ergonomic-awareness system.

Preserve the product flow defined in `AGENTS.md`:

```text
Camera
  ↓
Pose Detection
  ↓
Pose Quality / Visibility
  ↓
Sit / Stand Classification
  ↓
Posture Metrics
  ↓
Personal Baseline Comparison
  ↓
Real-Time Feedback
  ↓
Duration / Break Monitoring
  ↓
Session Summary
  ↓
History / Analytics
```

Do not reintroduce the previous physiotherapy workflow unless the user explicitly changes the product scope.

Do not independently add:

- symptom-based diagnosis;
- disease prediction;
- medical diagnosis;
- treatment plans;
- rehabilitation prescriptions;
- exercise dosage;
- red-flag clinical screening;
- claims that a detected posture caused a specific medical condition;
- unsupported universal posture thresholds presented as medical facts.

Pose and posture outputs must remain observational or ergonomic-supportive rather than diagnostic.

Prefer states such as:

- `good_alignment`;
- `needs_adjustment`;
- `low_confidence`;
- `unable_to_assess`;
- `sitting`;
- `standing`;
- `transitioning`;
- `not_visible`.

Do not convert uncertain pose data into confident feedback.

## Camera and pose-processing discipline

- Keep raw camera frames in the browser unless `AGENTS.md` is explicitly changed by an authorized product decision.
- Never upload or persist raw camera video merely to simplify implementation.
- Persist only approved derived metrics, bounded posture events, and session summaries.
- Explain the camera purpose before requesting permission.
- Release camera tracks, workers, timers, animation frames, observers, subscriptions, and related resources on every exit path.
- Handle camera states explicitly:
  - permission not requested;
  - permission denied;
  - no camera available;
  - unsupported browser;
  - person not visible;
  - partial body visibility;
  - low pose confidence;
  - calibration required;
  - camera disconnected;
  - recovery or retry.
- Never fabricate a pose classification when required landmarks are unavailable.

## Posture feedback discipline

- Separate pose detection from posture interpretation.
- Separate transient movement from sustained posture deviation.
- Use smoothing, debounce, hysteresis, or duration checks where appropriate so normal short movements do not immediately become alerts.
- Keep thresholds configurable and documented.
- Never present an arbitrary engineering threshold as a universal medical threshold.
- Prefer comparison against a user-specific calibration baseline where the product design supports it.
- Store enough metadata to make posture feedback explainable without storing unnecessary sensitive media.

Example:

```text
Observed:
- torso inclination changed from baseline
- required landmarks visible
- confidence sufficient
- deviation persisted beyond configured duration

Result:
needs_adjustment
```

Do not convert that into a medical claim such as:

```text
"You are sitting incorrectly and this will cause back pain."
```

## AI / LLM discipline

- The deterministic pose pipeline remains the source of posture state.
- An LLM must not become the primary posture classifier.
- An LLM must not convert uncertain metrics into a confident posture result.
- AI may be used only for bounded functions such as:
  - summarizing session statistics;
  - explaining already-computed metrics in user-friendly language;
  - generating non-diagnostic ergonomic-awareness summaries.
- Never send raw camera media to an LLM provider.
- Do not send unnecessary personal or sensitive data to external providers.
- Preserve deterministic fallback behavior when AI is disabled or unavailable.

## Verification discipline

Use the verification matrix in `AGENTS.md`.

During implementation:

- run the narrowest relevant test or check first;
- add regression coverage when changing established behavior;
- add boundary or integration coverage when behavior crosses services;
- do not weaken, delete, skip, or over-mock tests merely to obtain a pass.

For posture or camera work, verify relevant states where applicable:

```text
camera available
camera denied
camera unavailable
person visible
person partially visible
low confidence
sitting
standing
transitioning
baseline unavailable
calibrated
good alignment
needs adjustment
session pause
session end
resource cleanup
```

Do not claim a browser-camera or MediaPipe flow works unless it was actually exercised at the appropriate test level.

## Handoff

Before reporting completion:

1. inspect `git status --short --branch`;
2. re-read the final affected diff;
3. review verification output;
4. confirm affected documentation and contracts agree with the implementation.

Lead with the outcome, list exact checks run, distinguish project failures from environment limitations, and state remaining blockers or unverified behavior plainly.
