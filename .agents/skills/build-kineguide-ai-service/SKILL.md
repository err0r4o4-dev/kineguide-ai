---
name: build-kineguide-ai-service
description: Build and review KineGuide AI FastAPI, Pydantic schemas, provider adapters, bounded Thai text processing, readiness, and Python tests. Use for files under services/ai-python or behavior delegated from Go to the internal AI service.
---

# Build KineGuide AI Service

Keep the Python service stateless, internal, schema-driven, and unable to make final clinical decisions.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/python-ai.md`, and the Go-to-Python request contract.
2. Model every input and output with strict Pydantic schemas. Reject unexpected or oversized data.
3. Put provider-specific behavior behind the existing provider protocol. Keep the disabled provider deterministic and safe.
4. Use bounded HTTPX timeouts for outbound I/O. Never add primary database credentials or access.
5. Separate extraction, normalization, and explanation from clinical decisions. Return uncertainty and structured failure states.
6. Add deterministic pytest coverage for schemas, provider behavior, configuration, readiness, and failure modes.
7. Run Ruff check/format, mypy, pytest, and import/startup validation.

## Medical boundaries

The service may later assist with Thai symptom extraction, structured JSON, follow-up-question drafting, and plain-language explanation only after approved schemas exist. It must not diagnose, decide red flags, select exercises, prescribe dosage, or produce an authoritative rehabilitation plan.

Do not send raw camera media to a provider. Do not log prompts or outputs containing health information by default. Do not enable a real provider without explicit secrets management, data-processing review, consent scope, retention policy, and safety evaluation.
