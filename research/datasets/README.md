# Dataset policy

Datasets are deliberately excluded from Git. Before adding a local dataset, document its license, provenance, consent basis, de-identification, access controls, retention period, and deletion process. Never add health data, raw videos, or images to this repository.

## MultiPosture local schema screening

- Purpose: offline screening of a public sitting-posture dataset, not application
  inference, clinical assessment, or independent MediaPipe measurement validation.
- Source: Zenodo record `14230872`, DOI `10.5281/zenodo.14230872`; publisher API
  `https://zenodo.org/api/records/14230872`.
- Rights: the publisher API declares open access and `cc-by-4.0`. Preserve source,
  attribution and license metadata locally; cite the dataset and its associated
  paper, DOI `10.1109/ACCESS.2024.3510034`, in any later research output.
- Input: only `data.csv`, approximately 9.3 MB. No images, video or model weights.
  Store data and provenance under ignored `research/datasets/multiposture/`.
- Consent: the publisher describes privacy-preserving release of processed
  coordinates from 13 participants, but the retrieved record does not establish
  the original consent terms. Public access and a license do not prove consent.
  Installation permits local schema screening only; training, redistribution and
  deployment remain blocked pending a documented consent/provenance review.
- Sensitivity and access: participant-derived coordinates remain sensitive even
  without raw media. No re-identification, API upload, AI-provider submission,
  Git inclusion, CI artifact or shared registry. Ignore rules are not encryption
  or access control; use the local OS account and do not share this directory.
- Retention: remove participant data when screening ends, or within 30 days of
  installation (2026-11-18 for this installation), whichever comes first. This is
  a manual deadline, not an automated deletion service. Preserve only aggregate
  findings and public attribution. Do not delete unrelated datasets.
- Export/correction/deletion: no participant-level export is authorized. Correct
  source errors through the publisher; discard invalid local copies. To remove
  this installation, verify the absolute target is this dataset directory, then
  remove only `research/datasets/multiposture/` using the local filesystem. No
  application/database records are created; synced copies or backups, if any,
  require separate removal.
- Compatibility: the publisher describes 11 joints / 33 dimensions and 4,800
  frames, but the checksum-verified CSV actually has 33 named joints / 99
  coordinate columns and 4,794 rows. Resolve this discrepancy before adaptation.
  The publisher describes hip-centred 3D coordinates, not verified image-space
  landmarks. Do not fabricate visibility, frame dimensions or independent
  references. It cannot be passed directly to `research/seated-evaluation`, and
  cannot establish live-web error.
- Local evidence: `publisher-record.json`, `installation-manifest.json` and
  `schema-audit.json` accompany the installed CSV. Only aggregate audit results
  may be reported; never print sample coordinate rows or participant identifiers.

### Installation verification — 2026-10-19

- Downloaded 9,327,935 bytes; publisher MD5 matched
  `7efbc94d653acf32eefecec3ff26d6c6`.
- SHA-256: `d21579200db9a57dd01c24fa6ece961b0be73aa0d5d402ae8e629761c03ebe38`.
- Local Node audit: 4,794 rows, 102 columns (3 metadata, 99 coordinates),
  13 subject groups, 5 upper-body labels and 7 lower-body labels. No malformed
  rows, missing metadata, non-finite coordinates or unexpected labels found.
- Subject grouping exists, but no split, training or evaluation was performed.
  Class counts are unbalanced; do not use random frame splits as proof of
  generalization to new participants.

- Download: direct HttpClient requests returned HTTP 403; PowerShell
  `Invoke-WebRequest` succeeded using the public download link on Zenodo.
  The initial Python audit could not run because Python is unavailable; the
  replacement Node audit completed successfully without added dependencies.
- All four local data/provenance files passed `git check-ignore`. No application
  service, model, API, database or live classification behavior was changed.

### Offline trainer — 2026-10-19

`research/multiposture/` now provides a synthetic-tested, subject-separated
nearest-centroid trainer and aggregate classification reports. The installed
manifest remains blocked: public study-participation consent has been found, but
release/downstream-training consent has not been verified under this policy.
Actual training was denied with `KGMP_E_APPROVAL` and produced no artifacts.
See the trainer README for the evidence, commands and review requirements.
The paper describes reducing 33 joints to 11 for its model; the installed full
99-coordinate CSV is not a reproduction of that reduced representation. The
4,794/4,800 frame discrepancy and exact released preprocessing remain unresolved.

**Not medical advice / ไม่ใช่คำแนะนำทางการแพทย์:** these dataset labels are
research annotations, not diagnoses or proof that a sitting posture is safe.

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
