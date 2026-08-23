# Architecture overview

The React PWA owns presentation, camera permission, future MediaPipe inference, and derived movement metrics. It calls only the Go Main API. The Go API owns application orchestration and all PostgreSQL access. The Python AI Service is internal, stateless, and reached only by the Go API. Its LLM provider is disabled by default.

Raw camera frames do not cross the browser boundary. Future clinical logic must use explicit, versioned, clinician-reviewed rules; language models must not make diagnoses or final safety decisions.
