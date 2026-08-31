# KineGuide Clinical-Candidate Agent Flow

Status: **Educational Prototype – Pending Clinical Review**

## Runtime flow

```text
React chat
  -> authenticated Go API + current AI-chat storage consent
  -> deterministic pending movement list when applicable (no token cost)
  -> otherwise internal Python AI service
  -> OpenRouter with ZDR requested + data collection denied
  -> optional allowlisted tool request
  -> Go validates and executes the tool
  -> pending-review response saved to the user's conversation

React camera
  -> MediaPipe landmarks processed in browser only
  -> supported research demo phase transition
  -> technical cycle count shown locally
  -> raw frames and landmarks are neither uploaded nor stored
```

The LLM may request only `list_pending_movement_demonstrations` or `list_pending_evidence`. It cannot call a diagnosis, treatment-selection, dosage, progression, clinical-safety, approval, or database tool. Go owns orchestration and rejects unknown tool names.

## Evidence and clinical review

The catalog records the references supplied for neck/shoulder, low-back, exercise classification, home monitoring, pose feedback, and action scoring, plus WHO, NICE, and JOSPT guidance. Every record has `reviewStatus: pending_clinical_review`, `demoOnly: true`, `notForClinicalUse: true`, empty `sourceReferences`, and no reviewer or review timestamp. Bibliographic presence is not evidence that a particular exercise, dosage, or diagnosis is appropriate.

A qualified reviewer must verify applicability, population, intervention, outcomes, limitations, contraindications, stop conditions, dose, locale copy, licensing, and traceable source links. Only an item changed through the review workflow to `approved`, with reviewer identity, review time, sources, and demo flags removed, can satisfy the production eligibility check.

## Camera auto-count boundary

The browser has one research-only counter for `arm-abduction-research-demo`. It observes a coarse lowered -> raised -> lowered landmark sequence. The value is not a correctness score, clinical assessment, treatment recommendation, or proof of safe form. Low-confidence/missing frames reset the phase, manual counting remains available, and automatic counts are not persisted yet.

## Known limitations before production

- No clinical content is approved; no symptom-to-exercise recommendation is enabled.
- No diagnosis, red-flag determination, contraindication decision, dosage, schedule, intensity, or progression is generated.
- OpenRouter provider availability and ZDR support vary by selected model/provider and require deployment review.
- Tool calling is single-step; the model never receives tool results for autonomous reinterpretation.
- Camera measurements vary with viewpoint, occlusion, lighting, clothing, device, and model confidence.
- Clinicians must define and validate any future movement criteria and escalation behavior before it can be described as clinical guidance.
