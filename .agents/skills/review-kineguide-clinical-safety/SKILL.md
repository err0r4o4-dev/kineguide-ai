---
name: review-kineguide-clinical-safety
description: Review KineGuide AI product, code, prompts, content, pose feedback, and data models for medical boundaries and clinical safety. Use when behavior touches symptoms, consent, red flags, pain, exercises, rehabilitation plans, pose assessment, progress interpretation, or user-facing health language.
---

# Review KineGuide Clinical Safety

Review risk and evidence; do not invent clinical logic.

## Review process

1. Read `AGENTS.md`, `.agent/rules/healthcare-safety.md`, `docs/privacy-and-security.md`, and relevant clinical references.
2. Identify the intended user, context of use, decision being influenced, foreseeable misuse, and failure consequence.
3. Classify behavior as education, measurement, suggestion, clinician-reviewed rule, or prohibited diagnosis/prescription.
4. Trace the source and version of every threshold, red-flag rule, exercise rule, and safety message.
5. Check consent, uncertainty, escalation paths, stop conditions, pain feedback, accessibility, localization, and auditability.
6. Require deterministic tests for safety rules and boundary cases. AI output cannot be the final oracle.
7. Report findings by severity with file evidence, recommended control, and unresolved clinical-owner decisions.

## Non-negotiable boundaries

- Do not diagnose disease or injury.
- Do not let an LLM decide red flags, exercise eligibility, prescription, intensity, duration, or progression.
- Do not present pose estimation as proof of clinical correctness.
- Do not hide uncertainty or service/model failure behind confident language.
- Do not use unverified clinical sources or synthetic citations.
- Stop implementation when a required clinical decision lacks a qualified owner and approved source.

Always preserve both English and Thai medical disclaimers in user-facing foundational documentation.
