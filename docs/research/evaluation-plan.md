# Seated measurement evaluation plan

Status: offline measurement tooling implemented; real-data validation pending.
Source review: 2026-10-19. No external dataset was downloaded for this work.

## Scope and safety

ไทย: ประเมินความคลาดเคลื่อนของเรขาคณิต 2D ในภาพเท่านั้น ไม่วินิจฉัยโรค
ไม่รับรองว่าท่านั่งถูกต้อง และไม่สั่งการรักษาหรือออกกำลังกาย
ผลจากข้อมูลสังเคราะห์ไม่ใช่ความแม่นยำกับผู้ใช้จริง

English: This evaluates image-plane 2D geometry, not diagnosis, posture
correctness, treatment, or exercise prescription. Synthetic technical results
are not evidence of real-user accuracy or clinical validity.

The CLI in `research/seated-evaluation` calls the actual web geometry function
with explicit frame dimensions. It does not run MediaPipe, smoothing, camera
framing checks, personal calibration, temporal feedback, alerts, or an LLM.
Its coverage is geometry availability on supplied landmarks, not camera
tracking success. A successful offline report does not make the website
production-ready.

## Dataset screening decision

### MultiPosture: classification candidate, not measurement ground truth

The publisher describes 13 participants, 4,800 frames, 11 joints with 3D
coordinates normalized relative to the hip centre, and upper/lower body labels.
Its 33 input dimensions mean **11 joints times 3 coordinates**, not the
33 image landmarks expected by the browser. Coordinates were extracted with
MediaPipe Pose Heavy; raw images/videos are not supplied.

- Do not pad the missing joints, invent eye/ear positions or visibility, or
  interpret hip-centred coordinates as normalized image coordinates.
- Do not use MediaPipe-derived coordinates as independent ground truth for
  MediaPipe measurement accuracy.
- No direct importer is provided: image dimensions, image-space coordinates,
  landmark mapping, provenance and subject-separated splits must be established.
- The accessible record did not expose a readable license value during this
  review. License and original consent remain unverified; do not download or
  redistribute on an assumption of permission.
- It may inform a separate classification experiment after approval. Its
  trunk-position labels do not establish universal healthy-posture labels.

Source: [MultiPosture publisher record](https://zenodo.org/records/14230872),
DOI `10.5281/zenodo.14230872`.

### REHAB24-6: existing exercise baseline, not seated validation

The publisher supplies motion-capture references with 26 skeleton joints,
2D projections and synchronized videos for rehabilitation exercises. These
are not the same landmark definitions as MediaPipe's 33 image landmarks.
Projection/calibration error belongs to the reference uncertainty budget.
The existing local policy limits research inputs to approved 2D skeletons and
segmentation, excluding videos and new 3D imports.

- Keep the existing aggregate classifier results separate from seated-angle
  measurement results; do not reuse their accuracy as website accuracy.
- The dataset's academic/non-profit noncommercial terms do not authorize
  unrestricted commercial use. Follow `research/datasets/README.md`.
- Paired predictions and references require explicit joint definitions,
  synchronization and source dimensions. Existing skeletons alone cannot
  re-evaluate the browser camera-to-model pipeline.

Source: [REHAB24-6 publisher record](https://zenodo.org/records/13305826),
DOI `10.5281/zenodo.13305826`.

## Image-coordinate protocol

MediaPipe normalizes x by image width and y by image height. For explicit
dimensions, `calculateSeatedMetrics` uses x and `y * height / width`, equivalent
to pixel geometry divided by width. Shoulder width is therefore in image-width
units; the distance ratios remain dimensionless. Angles are image-plane degrees,
not anatomical 3D joint angles. Mirror direction and eye-versus-ear definitions
must match the reference. Torso inclination remains unavailable when hips are
not reliably visible.

Source: [MediaPipe Pose Landmarker output definitions](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/python).

The explicit-dimension method is `seated-image-v2`. Calls without dimensions
retain legacy normalized-square geometry for compatibility. The live website
still uses `seated-baseline-v1`, including its API/database constraints. Never
label an offline v2 report as validation of that live v1 workflow. A later
release needs a reviewed version migration, renewed calibration, tolerance
evaluation and end-to-end tests; do not silently swap its math or thresholds.

## Independent reference collection gate

Before involving participants, approve purpose, consent, access, retention,
deletion, reference quality and the written protocol. Do not record, upload or
persist camera media from the app. Derived coordinates are still sensitive
research data and are not authorized for application APIs or public artifacts.
Use an approved research store, never Git; local approved inputs may use the
ignored `research/datasets/` location. Aggregate reports remain private until
reviewed for small-cohort disclosure risk.

Start with a proposed 15-20-adult feasibility pilot, not a statistically powered
acceptance study. Include supported camera views, laptop/webcam devices,
ordinary/dim lighting, desk occlusion, motion and framing changes. Do not ask
participants to adopt painful or extreme positions. Record only minimum
pseudonymous metadata needed for comparison.

For each supported metric, obtain a synchronized independent reference with
the same coordinate space and landmark definitions. A reference operator must
not copy the model's answer. Predefine observer training and disagreement
handling. If a tool measures anatomical 3D motion rather than projected image
geometry, do not compare the angles directly. Document measurement resolution,
reference bias, projection error and synchronization uncertainty. If reference
creation requires recording, obtain a separately reviewed protocol first;
this change does not authorize that collection or relax the no-recording rule.

All frames and sessions of one participant belong to one partition. Freeze
formula, model, calibration and tolerances using development participants,
then evaluate unseen held-out participants. A JSON `held-out` label is only
a declaration; the CLI cannot verify participant overlap or provenance.

## Report interpretation and next experiments

- Report paired sample counts, reference availability, prediction abstention,
  MAE, RMSE, signed bias and nearest-rank P95 absolute error per metric.
- Angles use degrees; distance ratios are unitless. Missing references and
  unavailable predictions must not become zero error.
- Report conditions alongside coverage. Frame-weighted metrics can over-weight
  long sessions; report participant-level uncertainty in the subsequent study.
  Do not compute confidence intervals by treating adjacent frames as independent.
- No supported real-data result exists yet. Do not fill the website with an
  invented accuracy percentage, a per-frame error estimate, or visibility-as-accuracy.
- The next browser experiment must separately measure inference failure,
  smoothing delay, false alerts per hour, missed sustained events and P95 latency.
  The current evaluator does not measure any of those.
- Agree engineering acceptance targets before held-out testing. Public
  ergonomic or clinical interpretations require evidence and qualified review;
  this work does not define new clinical thresholds.

## Local verification

```powershell
New-Item -ItemType Directory -Path tmp -Force | Out-Null
node --test research/seated-evaluation/*.test.mjs
node research/seated-evaluation/evaluate.mjs --input research/seated-evaluation/synthetic.json --output tmp/seated-evaluation-synthetic.json
corepack pnpm --filter @kineguide/web exec vitest run src/features/pose/seatedMetrics.test.ts
```

Output must be a new file; choose a new name for repeated runs. Only synthetic
geometry is committed. See the evaluator README for the strict input schema,
limits and report fields. No dataset/model binary, participant coordinates,
videos or API changes are part of this implementation.

### Verification evidence (2026-10-19)

- `corepack pnpm format:check`: passed.
- `corepack pnpm lint`: passed, including OpenAPI lint (two existing explicitly ignored problems).
- `corepack pnpm typecheck`: passed.
- `corepack pnpm test`: passed; confirmed with `corepack pnpm --filter @kineguide/web exec vitest run --reporter=dot --silent`, 48 files / 211 tests.
- `$env:VITE_API_BASE_URL='/v1'; corepack pnpm build`: passed.
- `corepack pnpm test:seated-evaluation`: passed, 8 tests.
- `corepack pnpm evaluate:seated --input research/seated-evaluation/synthetic.json --output tmp/seated-evaluation-synthetic.json`: passed, one generated technical frame. The zero residuals are fixture consistency only, not real-data accuracy.
- New research scripts/fixture/README, root package and this plan passed Prettier checks with the existing web configuration.
- Browser E2E, real camera/device latency, real datasets and participant studies were not run. No live route, camera lifecycle, API or database behavior changed.
- Independent read-only review found no concrete defects in geometry or the evaluator. Windows junction/symlink cases and injected Vite/report-write failure cleanup were not tested; the implementation resolves real paths and closes Vite in `finally`, but those failure paths remain verification gaps.

Input SHA-256 in each report identifies the evaluated bytes, not the source
code revision or participant provenance. Preserve a reviewed code revision and
environment record alongside approved real-data experiments; no Git commit is
created automatically by this tool.
