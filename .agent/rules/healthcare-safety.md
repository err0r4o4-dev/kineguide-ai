---
trigger: model_decision
description: Apply to symptoms, consent, safety screening, pain, exercises, plans, pose feedback, progress, or medical language.
---

# Healthcare safety rule

Use `$review-kineguide-clinical-safety`.

- Do not invent clinical rules, thresholds, diagnoses, contraindications, or prescriptions.
- Require traceable authoritative sources and a qualified clinical owner.
- AI and pose estimation provide uncertain supporting information only.
- Preserve consent, stop conditions, pain feedback, escalation paths, and clear disclaimers.
- Stop and request direction when a safety decision lacks an approved owner or source.
