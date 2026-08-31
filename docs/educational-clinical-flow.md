# Educational clinical flow prototype

## Status and intended use

This is an **Educational Prototype – Pending Clinical Review**. It does not diagnose, select treatment, determine medical safety, prescribe exercise dosage, or establish that a movement is suitable for a user.

All mock clinical-flow records are versioned and carry these invariants:

- `reviewStatus: pending_clinical_review`
- `demoOnly: true`
- `notForClinicalUse: true`
- `reviewedBy: null`
- `reviewedAt: null`
- `sourceReferences: []`

The placeholders deliberately contain no symptom, red-flag, contraindication, treatment, or stop-condition rule. They exist only to verify routing and UI states.

## End-to-end data flow

The account-scoped chat recognizes explicit requests to view movements and returns the full
pending-review demonstration list from the Go-owned catalog. This deterministic response does not
require an LLM token and does not select or rank a movement from the user's symptom text.

```text
Active prototype consent
  -> React requests localized mock catalog from Go
  -> user selects a clearly labelled synthetic placeholder
  -> Go validates consent and routes the placeholder deterministically
     -> stop placeholder: stop the demo and show a non-clinical escalation message
     -> continue placeholder: show pending-review movement demonstrations only
  -> user opens a demo and explicitly starts the browser camera
  -> MediaPipe extracts landmarks locally in the browser
  -> browser renders technical framing feedback locally
  -> on explicit technical-feedback action, React sends Go only:
       pose status + up to 33 visibility scores
  -> Go verifies session ownership and calls internal Python
  -> Python returns confidence and technical camera feedback only
       movement phase = unavailable
       automatic repetition count = null
  -> user stops or completes the session
  -> Go stores the existing minimal session summary in PostgreSQL
```

Raw frames, video, images, recordings, face/hand data, blink estimates, and landmark coordinates never cross the browser boundary. Technical visibility values are transient and are not persisted. Session history stores only the movement-demo slug, camera-used flag, status, manual count, elapsed time, and timestamps.

## Schemas

The public contract defines versioned records for screening questions, red-flag placeholders, movement demonstrations, contraindication placeholders, stop-condition placeholders, clinical references, and clinical-review metadata. Runtime schemas are in `packages/contracts/openapi/kineguide-api.yaml`; Go domain construction is in `services/api-go/internal/product/clinical_flow.go`.

The review lifecycle is:

```text
draft -> pending_clinical_review -> approved | rejected -> archived
```

Only `approved` content may enter a future production clinical flow, and only when all of the following are true:

1. `demoOnly` and `notForClinicalUse` are false;
2. `reviewedBy` identifies an authorized qualified reviewer;
3. `reviewedAt` records the review time;
4. `sourceReferences` contains at least one traceable approved reference;
5. the locale-specific wording, intended population, exclusions, stop conditions, and version are approved together;
6. deterministic boundary tests pass.

Changing a status in data is insufficient by itself. Production eligibility is deny-by-default in the Go domain.

## Python AI boundary

Python is stateless and cannot access PostgreSQL. For this prototype it accepts only derived pose status and visibility scores. It may calculate a technical confidence average and return camera framing state. It does not receive enough information to diagnose, select a movement, decide safety, generate treatment, determine movement correctness, or prescribe sets and repetitions.

Landmark extraction remains in React because repository privacy architecture requires camera media to stay in-browser. Movement-phase detection and automatic repetition counting remain explicitly unavailable until a reviewed technical method, synthetic fixtures, confidence behavior, and clinical interpretation boundary exist.

## Known limitations

- Screening and stop/red-flag content is synthetic routing data with no clinical meaning.
- Contraindication and clinical-reference collections are intentionally empty.
- Every movement remains `pending_clinical_review`.
- The flow cannot state that a movement is suitable for a symptom or person.
- No treatment benefit, recovery, correctness, dosage, progression, or risk claim is available.
- Technical confidence describes visibility input only, not movement quality or health status.
- Automatic phase detection and repetition counting are unavailable.
- Production backup expiry, scheduled retention enforcement, export, and formal privacy ownership remain unresolved release gates.

## Required physiotherapist review before production

A qualified, authorized reviewer must provide and approve each locale-specific record, including intended population, exact question wording, answer semantics, escalation action, exercise purpose, contraindications, stop conditions, evidence citations, review identity/time, and version. The team must then add deterministic tests for every approved rule, perform usability and safety evaluation with synthetic cases first, complete privacy/legal review, and release approved content separately from code.
