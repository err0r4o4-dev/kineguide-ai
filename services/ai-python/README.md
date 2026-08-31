# Python AI Service

This internal FastAPI service defines the future language-model boundary. Its deterministic disabled provider cannot generate medical advice, diagnoses, safety decisions, or exercise plans. It has no database configuration or primary database access.

Create a virtual environment, install `.[dev]`, then run `uvicorn app.main:app --reload --port 8001`. Quality checks are `ruff check .`, `mypy app`, and `pytest`.

Endpoints: `GET /health`, `GET /ready`, `GET /v1/health`, internal `POST /v1/chat/responses`, `GET /docs`, `GET /redoc`, and `GET /openapi.json`.

`POST /v1/pose/technical-feedback` accepts only derived pose status and up to 33 visibility scores. It returns transient technical camera feedback and a visibility confidence average. It deliberately returns `movement_phase: unavailable` and `repetition_count: null`; raw media, landmark coordinates, diagnosis, treatment, suitability, and clinical safety decisions are forbidden.

The provider protocol is shaped to later support bounded Thai symptom extraction, structured JSON, follow-up-question drafting, and user-friendly explanations. Each capability requires a separately reviewed schema and safety policy.

`LLM_PROVIDER=mock` enables a deterministic, non-clinical fixture response for local tests only and is rejected in production. `disabled` remains the default. No real provider is enabled until consent, retention, data-processing, clinical-safety evaluation, and secrets review are complete.
