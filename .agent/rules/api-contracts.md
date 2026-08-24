---
trigger: model_decision
description: Apply when endpoints, schemas, error shapes, status codes, clients, or packages/contracts change.
---

# API contract rule

Use `$evolve-kineguide-contracts`.

- Treat `packages/contracts/openapi/kineguide-api.yaml` as the public Go API source of truth.
- Update OpenAPI, Go behavior, typed web consumers, examples, and tests together.
- Prefer backward compatibility and explicitly plan breaking changes.
- Document errors, nullability, units, authentication, and sensitive-data exclusions.
- Run Redocly and all affected service checks.
