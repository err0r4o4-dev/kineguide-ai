# Dataset policy

Datasets are deliberately excluded from Git. Before adding a local dataset, document its license, provenance, consent basis, de-identification, access controls, retention period, and deletion process. Never add health data, raw videos, or images to this repository.

## REHAB24-6 local research use

- Purpose: evaluate a research-only correct/incorrect movement classifier for the
  KineGuide university prototype.
- Source: Zenodo record `13305826`, DOI `10.5281/zenodo.13305826`.
- License: academic or non-profit noncommercial research use only; publications
  must cite the related REHAB24-6 paper. Commercial use requires permission from
  the dataset owner.
- Local inputs: `2d_joints.zip`, `Segmentation.csv`, `Segmentation.txt`, and
  `joints_names.txt`. RGB videos, markers, and 3D data are out of scope.
- Consent basis: the dataset record states that ten participants consented to
  public release. KineGuide does not independently verify the original consent.
- Classification: participant-level derived movement data; treat as sensitive
  research data even though direct identifiers and raw video are excluded.
- Access: local development workspace only. Do not upload to application APIs,
  external AI providers, Git, logs, CI artifacts, or shared model registries.
- Retention: retain raw participant-level files only for the active experiment.
  Delete them after aggregate evaluation and a reproducible transform manifest
  have been produced.
- Output: commit only source code, non-sensitive configuration, citations, and
  aggregate metrics that cannot be traced to an individual participant.
- Deletion: remove the ignored local `research/datasets/rehab24-6` directory after
  evaluation; model artifacts remain ignored and require a separate release
  review before distribution or browser use.
