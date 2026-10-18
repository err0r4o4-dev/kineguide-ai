# Offline MultiPosture classification baseline

Dependency-free Node.js 24+ research tooling. It does not change the application,
load a browser model, diagnose a condition or determine whether a posture is safe.

## Method

The baseline uses the 99 named XYZ columns in the installed CSV in a fixed order.
Subject identifiers and labels are never features. It fits per-feature population
means and standard deviations on training subjects only (constant columns use a
scale of 1), then computes separate class centroids for upper- and lower-body
labels. Prediction is the nearest standardized centroid by squared Euclidean
distance; exact ties use the documented label order in `training.mjs`.

Leave-one-subject-out cross-validation holds out all rows for one participant at
a time, refitting both scaler and centroids for every fold. Every row is predicted
once without its participant in training. No random frame split, oversampling,
hyperparameter search, confidence score or tuned acceptance threshold is used.
The model saved after evaluation is a separate refit on all approved input rows;
its training predictions are not used for the reported cross-validation scores.

This is a new simple baseline, not a reproduction of the paper's neural networks
or its reduced 11-joint input. The input is treated as published numeric XYZ data;
its transformation into browser inputs is not established. No visibility, image
dimensions, missing joints or independent references are fabricated.

## Reports

`report.json` includes separate upper/lower accuracy, error rate (`1 - accuracy`),
fixed-label Macro-F1, balanced accuracy, per-class precision/recall/F1/support and
confusion matrices (rows actual, columns predicted). Undefined precision/recall/F1
is 0 and all 5/7 predefined labels remain in the macro denominator. It also reports
a training-fold majority-class baseline, the mean and range of participant
accuracies, and the number of folds with test classes absent from training.

Accuracy is frame-weighted. Frames from a recording are correlated; participant
means are provided separately and no confidence intervals are claimed. There is
no untouched final holdout after cross-validation; do not repeatedly tune against
these folds and call the result independent validation.

Reports omit participant identifiers, per-participant scores, coordinates and
per-row predictions. Models contain aggregate scaler/centroid arrays, not raw
training rows; those derived artifacts still require local sensitive-data handling.
Both artifacts carry input, approval-manifest and implementation SHA-256 hashes
and Node runtime version. The report also hashes the serialized model bytes.
Deterministic reruns on identical bytes/code/runtime produce identical artifacts.

`liveValidation`, `measurementErrorEstablished` and `clinicalValidation` are false;
the model has `deploymentEligible: false`. These scores would measure dataset label
classification, not MediaPipe position/angle error or real-web accuracy. No browser
visibility, framing, temporal smoothing, calibration or abstention path is tested.

## Approval gate and current status

The installed manifest is still **blocked**. It declares
`originalConsentVerified: false` and `trainingAuthorized: false`. The CLI rejects
it with `KGMP_E_APPROVAL` before reading participant CSV bytes or creating outputs.

Public evidence found on 2026-10-19:

- Zenodo record `https://zenodo.org/records/14230872` declares public processed
  keypoints and its API identifies CC-BY-4.0.
- The authors' paper, DOI `10.1109/ACCESS.2024.3510034`, reports informed consent
  for study participation. A deposited copy is accessible through
  `https://hdl.handle.net/11250/3197493`. This does not establish the scope of
  consent for public release/downstream training required by the dataset policy.
- The paper explains 33 MediaPipe joints reduced to 11 joints for model input;
  that explains why the full 99-coordinate CSV differs from the reduced model
  description. It does not settle whether the released CSV retains the original
  world-coordinate units or additional preprocessing. The 4,794/4,800 row-count
  discrepancy is still unresolved; rows must not be invented to match the paper.

Before real-data training, a project data owner must review evidence covering
public release and downstream ML use, document preprocessing/provenance and the
row discrepancy, and approve this local research purpose. Only after that review
should the ignored manifest record `originalConsentVerified: true`,
`trainingAuthorized: true` and a public HTTPS `consentEvidence` reference, with the
verified byte count and input SHA-256. **Do not toggle these flags just to run the
command.** They are reviewer declarations, not proof the software can authenticate;
the CLI does not perform a legal or ethics review.

## Commands

Run the tests (synthetic data only):

```powershell
corepack pnpm test:multiposture
```

After documented approval, create the ignored `tmp/` directory if absent and
choose a new output directory name on every run:

```powershell
corepack pnpm train:multiposture --input research/datasets/multiposture/data.csv --manifest research/datasets/multiposture/installation-manifest.json --output-dir tmp/multiposture-baseline-2026-10-19
```

Arguments must appear in exactly that order. Input CSV is bounded to 10,000,000
bytes and 5,000 rows; manifest to 65,536 bytes. Only the expected unquoted numeric
CSV schema is accepted; unsupported quoting, blank values, invalid labels,
non-finite/over-bound coordinates and malformed rows fail closed. The numeric
bound of 1,000,000 is computational, not a medical or anatomical threshold.

Outputs must be a new child directory beneath the real repository's ignored
`tmp/` or `research/models/`. Its parent must already exist; existing directories
are not overwritten. Real-path checks reject ordinary symlink/junction escapes.
No network requests or new dependencies are needed. Both artifacts are written
to a private staging directory and renamed into place together after successful
writes. Failed writes report `KGMP_E_WRITE` and remove the two staged files and
their empty directory; cleanup failure reports `KGMP_E_CLEANUP`. No automatic
recursive deletion occurs in the trainer. Concurrent filesystem mutation and
Windows junction escape cases have not been verified in integration tests.
Use a single writer: a concurrent process creating an empty final directory
between the absence check and rename may have that directory replaced on some
platforms. Existing stable output directories are rejected; strict no-replace
publication against concurrent filesystem writers is not guaranteed.

The source dataset's retention deadline also applies to derived models. Keep
everything local, excluded from Git, APIs, AI providers, CI and shared registries;
delete when the experiment ends or by 2026-11-18, whichever comes first. Unix
file modes are requested; Windows access still depends on the local account ACL.
No application data, recordings or images are collected by this tool.

## Verification on 2026-10-19

- Regression and CLI integration tests ran on generated data, including correct
  hand-computed metrics, training-only scaling, subject isolation, deterministic
  artifacts, invalid input, approval denial and redacted process errors.
- `corepack pnpm test:multiposture`: 13 tests passed, including injected report
  write failure with no published partial model or staging files left behind.
- `corepack pnpm test:seated-evaluation`: 8 existing tests passed.
- `corepack pnpm test`: 48 web test files / 211 tests passed.
- `corepack pnpm format:check` and explicit Prettier checks of this package,
  dataset policy and root package passed. Application lint/typecheck/build/E2E
  were not rerun: no application, contract, dependency or runtime configuration
  changed in this task.
- The real installed manifest was passed to the CLI: `KGMP_E_APPROVAL`, exit 1,
  and no output directory created. **No real-data training or accuracy result
  exists from this implementation.**
- Independent review confirmed subject separation and metric logic; its
  partial-write finding was fixed with staging and fault-injection coverage.
  Its concern about editable approval declarations remains a documented limit:
  this tool has no trusted-signature verification and is not an adversarial
  authorization boundary. The real manifest has not been modified or unblocked.
  A final review identified the concurrent empty-directory rename race noted
  above; single-writer operation is required and that race is not covered.

**Not medical advice / ไม่ใช่คำแนะนำทางการแพทย์:** research posture labels do not
establish a diagnosis, treatment recommendation or safe sitting posture.
