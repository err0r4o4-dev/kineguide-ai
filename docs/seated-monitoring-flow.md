# Seated monitoring flow (SF1)

## Purpose and status

This implementation brief describes the approved seated-monitoring flow for the project team. It is an acceptance target, not a claim that the complete flow has shipped. Track implementation and verification under SF1 in the root [TODO](../TODO.md); this document is not a second backlog.

Automatic sit/stand classification is not currently implemented. Camera positioning for that capability remains unresolved, and no validated, authorized reference or thresholds are available. The user's seated-mode confirmation records intent; it does not detect sitting. Session duration and baseline-relative feedback must not be presented as validated sitting time. This unresolved capability does not prevent independent improvements to the flow below.

## Flow and acceptance

1. **Start, authentication and consent.** An authenticated user with the required current consent can enter the monitoring flow. Missing authentication or consent leads to the appropriate recovery path before camera processing or session creation. Preserve existing consent and access controls.
2. **Setup and user-confirmed seated mode.** Explain the camera purpose and let the user confirm their intended seated setup during preflight. Setup must not call `getUserMedia`. The confirmation records intent; it is not automatic classification or evidence of sitting throughout the session. The legacy calibration entry must navigate to the real setup.
3. **Create session and start camera.** Create the session after setup, then enter the live session. A single explicit Start Camera action in live requests camera access. Show denied, unsupported and retry states without treating them as successful tracking.
4. **Frame quality and personal baseline in live.** Show actionable technical frame-quality feedback and offer calibration in the live session using existing quality requirements. Frame quality does not establish sitting or safe posture. Show failure and retry paths when samples are insufficient or framing changes. The baseline is a personal reference for relative estimates, not proof of safe or medically correct posture. Usable tracking alone does not establish baseline-relative feedback.
5. **Tracking, pause and finish.** Process only ready and fresh pose data; suspended tracking must not reuse stale observations. Preserve low-confidence and unavailable states without converting missing or unreliable landmarks into confident feedback. Pause and resume must make session timing and monitoring state understandable; the delayed timer correction using a monotonic accumulated clock is still in flight and is not accepted here as complete. Finishing must handle persistence failure without presenting an unsaved result as saved. Release camera resources on exit. Validate lifecycle behavior against the implementation and its tests before marking SF1 complete.
6. **Summary and history.** Show only recorded data and distinguish assessed, unassessed and unobserved coverage against the stated denominator. Do not label elapsed or assessed time as validated sitting time. Empty, unavailable and save-failure states must remain honest. Confirm history reflects the saved record rather than assuming a successful write.

## Data and interpretation boundaries

Raw camera media stays in the browser. Preserve current consent, access, retention, deletion and logging controls described in [privacy and security](privacy-and-security.md); this brief authorizes no new collection or retention. The existing `seated-baseline-v1` implementation uses in-memory baseline statistics and engineering tolerances for relative 2D estimates. Those tolerances are not clinical thresholds. Missing landmarks, unsuitable framing, expired or shifted baselines require an unavailable, low-confidence or recalibration state as appropriate.

Starting recalibration invalidates the active baseline and suspends accumulation. If recalibration fails, subsequent frames do not add to the prior totals; the earlier totals and their summary framing remain available. A session summary cannot combine `upper_body` and `full_torso` modes: recalibration with a different mode fails with `mixed_framing`. Restore the previous framing to recalibrate or start a new session.

The current code provides technical frame checks in `apps/web/src/features/pose/cameraFramingQuality.ts`, baseline construction and validity checks in `apps/web/src/features/pose/seatedCalibration.ts`, and calibration and feedback coordination in `apps/web/src/features/pose/usePostureMonitor.ts`. The flow above is the confirmed implementation target; lifecycle and summary changes are in progress and require a final source sync. It introduces no classifier, new duration fields or API schema changes.

## Evidence and remaining validation

- [OSHA computer workstation positions](https://www.osha.gov/etools/computer-workstations/positions) provides workstation positioning context, not a validated camera classifier or a personal posture-safety determination.
- [WHO 2020 guidelines](https://www.who.int/publications/i/item/9789240015128) provide physical activity and sedentary behaviour context; they do not validate this application's sitting detection or thresholds.
- [MediaPipe Pose Landmarker for web](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js) describes pose landmark tooling, not validation of this application's sit/stand classifier or camera setup.
- [Tremblay et al. (2017), DOI 10.1186/s12966-017-0525-8](https://doi.org/10.1186/s12966-017-0525-8) provides sedentary behaviour terminology; a pose estimate or session timer alone does not establish that definition.

Full-vision acceptance remains unmet until camera placement and the intended sit/stand states are specified, an authorized reference and evaluation method are established, and performance and failure states are validated for the intended use. No classifier, medical threshold, or validated sitting-time claim follows from the references above. Source changes, lifecycle checks, summary/history behavior and final documentation consistency remain to be verified under SF1.
