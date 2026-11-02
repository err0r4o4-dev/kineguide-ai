# Evaluation artifacts

Store small, non-sensitive evaluation definitions and aggregate results here. Large artifacts and participant-level data belong in an approved external store.

## Seated geometry evaluation

The local CLI and synthetic smoke fixture live in `../seated-evaluation/`.
See `../../docs/research/evaluation-plan.md` for dataset screening, independent
reference requirements and the distinction between offline `seated-image-v2`
and live `seated-baseline-v1`. Reports default to no publication: use ignored
`tmp/` output and review small-cohort disclosure risk before sharing. No actual
seated dataset accuracy is established by the synthetic fixture.

## REHAB24-6 baseline

`rehab24-6-baseline.json` contains aggregate leave-one-subject-out metrics from
the research-only pipeline in `research/pose_classifier`. The input is limited
to clean front-view 2D skeleton repetitions. No participant-level coordinates,
video, identifiers, or trained model parameters are included.

The baseline is a release gate, not evidence of clinical validity. An exercise
must remain unavailable for automatic correct/incorrect output when accuracy,
sensitivity, specificity, sample size, cross-device validation, or clinical
review is inadequate. The current results do not meet that bar.
