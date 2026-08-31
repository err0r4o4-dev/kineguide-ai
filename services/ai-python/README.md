# Python AI Service

This internal FastAPI service defines the language-model boundary. Its providers cannot make diagnoses, safety decisions, prescriptions, or exercise plans. It has no database configuration or primary database access.

Create a virtual environment, install `.[dev]`, then run `uvicorn app.main:app --reload --port 8001`. Quality checks are `ruff check .`, `mypy app`, and `pytest`.

Endpoints: `GET /health`, `GET /ready`, `GET /v1/health`, internal `POST /v1/chat/responses`, `GET /docs`, `GET /redoc`, and `GET /openapi.json`.

`POST /v1/pose/technical-feedback` accepts only derived pose status and up to 33 visibility scores. It returns transient technical camera feedback and a visibility confidence average. It deliberately returns `movement_phase: unavailable` and `repetition_count: null`; raw media, landmark coordinates, diagnosis, treatment, suitability, and clinical safety decisions are forbidden.

The provider protocol is shaped to later support bounded Thai symptom extraction, structured JSON, follow-up-question drafting, and user-friendly explanations. Each capability requires a separately reviewed schema and safety policy.

`LLM_PROVIDER=mock` enables a deterministic, non-clinical fixture response for local tests only and is rejected in production. `disabled` remains the default.

The optional OpenRouter adapter requires `LLM_PROVIDER=openrouter`, a server-side `LLM_API_KEY`, and an explicit `LLM_MODEL`. It requests zero-data-retention providers, denies provider data collection, and exposes only two tool requests: list pending movement demonstrations and list pending evidence. Go executes and validates those tools. Deployment still requires consent, retention, data-processing, clinical-safety, provider-policy, and secrets review; a provider refusing the requested privacy controls is treated as unavailable.
