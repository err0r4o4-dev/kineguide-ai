# Seated evaluation harness

This bounded CLI evaluates only the explicit-dimension, offline seated-geometry
calculation against supplied 2D technical references. It is not live browser
end-to-end validation, baseline-classifier validation, clinical validation, or
evidence of posture correctness.

Requires Node.js 24 or newer (import.meta.main).

Install the repository dependencies first, then run from the repository root.
Create the ignored `tmp/` directory if it does not exist. The output parent
must already exist; choose a new report filename for every run.

```bash
node research/seated-evaluation/evaluate.mjs --input research/seated-evaluation/synthetic.json --output tmp/seated-evaluation-synthetic.json
node --test research/seated-evaluation/*.test.mjs
```

`--input` and `--output` are required. Input reading is bounded to 1 MiB and
5,000 records. The CLI resolves input and output-parent real paths, never
overwrites a file, rejects outputs in `research/`, and permits repository-local
reports only under ignored `tmp/`.

## Input schema

The JSON document has `schemaVersion: 1`, a `dataset`, and a non-empty
`records` array. `dataset.name` and `dataset.license` are non-empty strings of
at most 256 characters; `dataset.source` is at most 1,024 characters.
`referenceKind` is `synthetic` or `independent-2d`; `split` is `development` or
`held-out`. The split is a declaration only: this harness does not verify a
held-out partition.

Dataset metadata must contain public source/license descriptions only, never
participant names, contact information or private links. These descriptions
are copied into the aggregate report; the tool does not anonymize free text.

Each record has a pseudonymous `subjectId`, `condition` (`daylight`, `dim`,
`occluded`, `framing-shift`, or `standard`), integer `frame.width` and
`frame.height`, exactly 33 numeric `{x,y,visibility}` landmarks, and a
`reference`. Visibility is in `[0,1]`. Reference values may be omitted;
shoulder and head angles are signed degrees in `[-90,90]`, torso inclination is
`[0,90]`, and both ratios are in `[0,1000000]`. The ratio upper bound is a computational input limit that prevents unsafe squared-error calculations; it is not a clinical threshold. `torsoInclinationDegrees` may be
`null`.

References must come from a non-MediaPipe process. An `independent-2d` claim is
metadata supplied by the dataset author and cannot be verified automatically.
All frames and sessions from the same participant must remain in the same
train, development, or test partition; do not split a participant across
partitions.

## Reports and limits

Each metric reports its unit, reference count, missing-reference count,
unavailable-prediction count, paired count, and a nullable error summary. A
rejected frame still contributes to unavailable-prediction accounting. MAE,
RMSE, bias, and P95 absolute error are frame-weighted over supplied reference
pairs; no confidence intervals or error targets are reported. Shoulder and head
error use the shortest signed difference for an undirected line in `[-90,90)`;
torso and ratios use ordinary differences. Per-condition reports use the same
accounting and frame weighting.

The report declares `pipelineScope: "offline-seated-geometry"` and
`liveValidation: false`. It excludes subject IDs, landmarks, and frame
payloads. It reports no accuracy, latency, classifications, sessions, alerts,
F1, or real-world performance claim.

The committed fixture contains hand-derived, corrected explicit-dimension
values for a generated technical frame. It is a consistency test input only,
not an independent oracle or clinical ground truth. Do not add participant
data, videos, images, or identifiable coordinates to this repository.
