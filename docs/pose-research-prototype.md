# Pose research prototype

## Scope

KineGuide performs pose estimation in the browser. Raw camera frames and
landmark sequences are not uploaded or persisted. The current implementation
uses landmarks only for technical visibility and framing. It does not diagnose,
prescribe, or certify movement as clinically correct.

## Implemented research method

The shoulder research profile records the method described by Pereira et al.,
“A Machine Learning App for Monitoring Physical Therapy at Home,” Sensors 2024,
24(1), 158, DOI `10.3390/s24010158`, PMCID `PMC10781250`.

The paper:

- extracts 33 three-dimensional MediaPipe landmarks;
- compares corresponding landmark vectors with cosine similarity;
- averages the 33 similarities for a frame;
- reports a study-specific threshold greater than 90%;
- uses Dynamic Time Warping to compare sequences performed at different speeds;
- compares frontal smartphone recordings against motion-capture measurements.

KineGuide implements the bounded cosine and DTW calculations as a research-only
engine. It always returns `clinicalVerdict: null`. The production pose source
does not include reference-video authoring, a real-time correctness comparator,
or browser persistence for reference landmark sequences.

The browser comparison function also checks the registered reference-sequence
status before doing any calculation. A supplied landmark sequence cannot bypass
the `missing_clinician_reference` gate. The calibration screen exposes the
method, supported front-view shoulder scope, source, and unresolved gate without
starting the camera, retaining landmarks, showing a score, or labeling movement
as correct or incorrect.

## Release gate

The paper does not provide a KineGuide-ready reference landmark sequence. The
engine therefore remains unavailable to end users until all of the following
exist:

1. a purpose-recorded reference demonstration from a qualified physiotherapist;
2. documented camera placement, mirroring, coordinate system, and exercise scope;
3. a versioned landmark sequence derived without retaining identifiable video;
4. independent validation on the intended population and supported devices;
5. clinical approval of every user-facing interpretation and feedback message.

The reported 90% threshold must not be reused for sit-to-stand, knee extension,
or another exercise without exercise-specific validation.

The daily-movement catalog therefore declares `analysis_available: false` for sitting, standing, sit-to-stand, and walking. The browser may report only whether the required landmarks are technically visible. It does not report posture correctness, gait quality, movement phase, or automatic counts.

## Residual implementation risk

The former placeholder angle thresholds, joint-error verdicts, correctness
colors, reference-video processor, real-time comparator, and local reference
model storage have been removed. Automatic repetition counting now returns an
explicit unavailable state because no clinician-reviewed rule exists.

The remaining research engine is still not releasable for user assessment. It
has no approved KineGuide-compatible reference sequence, does not establish
clinical correctness, and must not gain an authoring or persistence path until
purpose, consent, retention, deletion, clinical ownership, and validation are
reviewed together.

## Evidence limitations

The cited study used 15 volunteers and excluded people with relevant
musculoskeletal or neurological conditions and extreme obesity. It evaluated
six head, trunk, and shoulder movements and identified the need for larger,
more diverse studies and additional camera views. These limitations prevent a
general claim that a research similarity score proves safe or correct movement.

Supporting technical evidence: the UCO Physical Rehabilitation study evaluated
27 participants, eight rehabilitation exercises, five camera views, and an
OptiTrack reference. It found material differences between viewpoints and found
the frontal view most convenient in that experimental setup. It does not supply
clinical correctness rules for KineGuide exercises.

## Sources

- https://pmc.ncbi.nlm.nih.gov/articles/PMC10781250/
- https://pubmed.ncbi.nlm.nih.gov/38203019/
- https://www.mdpi.com/1424-8220/24/1/158
- https://pmc.ncbi.nlm.nih.gov/articles/PMC10648737/
