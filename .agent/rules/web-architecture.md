---
trigger: model_decision
description: Apply to React structure, components, hooks, state, forms, routing, API clients, environment configuration, or files under apps/web/src.
---

# Web architecture rule

Use `$build-kineguide-web`.

- Keep route composition in `src/routes` and domain behavior in `src/features/<feature>`.
- Keep shared application components in `src/components`, reusable hooks in `src/hooks`, infrastructure helpers in `src/lib`, and public Go API calls in `src/services`.
- Keep feature-specific components, schemas, hooks, and tests together. Promote to `packages/ui` only after demonstrated cross-surface reuse.
- Use TanStack Query for server state, React Hook Form with Zod for forms, URL state for shareable navigation state, and local React state for local interaction.
- Do not mirror query data into local state or add a second query, HTTP, routing, localization, form, or styling abstraction.
- Use strict TypeScript and contract-derived types when available. Avoid `any`, unjustified casts, and duplicated response models.
- Keep browser calls behind the centralized Axios client, use abort signals and bounded timeouts, and call only the Go API.
- Map validation errors to fields or an accessible form summary. Preserve safe entered values after recoverable failures.
- Add dependencies only after confirming the installed stack cannot solve the problem cleanly; evaluate maintenance, license, bundle cost, and security impact.
