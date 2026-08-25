# Python AI Service

This internal FastAPI service defines the future language-model boundary. Its deterministic disabled provider cannot generate medical advice, diagnoses, safety decisions, or exercise plans. It has no database configuration or primary database access.

Create a virtual environment, install `.[dev]`, then run `uvicorn app.main:app --reload --port 8001`. Quality checks are `ruff check .`, `mypy app`, and `pytest`.

Endpoints: `GET /health`, `GET /ready`, `GET /v1/health`, `GET /docs`, `GET /redoc`, and `GET /openapi.json`.

The provider protocol is shaped to later support bounded Thai symptom extraction, structured JSON, follow-up-question drafting, and user-friendly explanations. Each capability requires a separately reviewed schema and safety policy.
