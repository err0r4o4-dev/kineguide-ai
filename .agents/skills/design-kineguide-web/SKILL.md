---
name: design-kineguide-web
description: Design and redesign KineGuide AI React interfaces with Thai-first healthcare UX, responsive layout, semantic design tokens, accessible interaction states, and clinically safe copy. Use for new pages or components, visual redesigns, layout and navigation work, design-system decisions, responsive behavior, and UI polish under apps/web.
---

# Design KineGuide Web

Create calm, accessible interfaces that make health-support states and uncertainty easy to understand without drifting from the existing React stack.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/web.md`, `web-design.md`, `web-accessibility.md`, and `packages/ui/DESIGN_TOKENS.md`.
2. Inspect the current route, related components, global styles, translation keys, tests, and every reachable state before proposing a design.
3. Write a short design read covering the user goal, audience, primary device, information hierarchy, safety-critical content, and whether the work is new UI or a targeted redesign.
4. Reuse established tokens, layout widths, typography, Lucide icons, components, and interaction patterns. Identify the smallest missing primitive before creating one.
5. Inventory loading, empty, success, degraded, offline, permission, validation, low-confidence, and failure states that apply.
6. Design mobile-first from 320 px, then verify 768, 1024, and 1440 px. Keep primary actions and urgent stop or pain guidance available without hover.
7. Add Thai copy first and matching English keys. Use plain, non-diagnostic language and make uncertainty explicit.
8. Implement through `$build-kineguide-web`, add observable tests, and verify keyboard, reduced-motion, responsive, and production-build behavior.

## Design guardrails

- Prefer semantic hierarchy and whitespace over decorative containers.
- Use cards, borders, shadows, gradients, overlays, and motion only when they communicate grouping, depth, or state.
- Do not invent colors outside the semantic token direction or introduce another icon, styling, or component system without a demonstrated gap.
- Do not hide consent, pain, stop, error, or low-confidence information behind animation, hover, tooltip-only content, or color alone.
- Keep Thai wrapping natural and avoid unexplained abbreviations.
- Preserve functionality during redesigns and make interaction or contract changes explicit.
- Do not claim diagnosis, guaranteed outcomes, clinical precision, regulatory compliance, or treatment authority.

## Verification

Check semantic structure, keyboard focus, labels, contrast, touch targets, 200% zoom, reduced motion, representative viewport widths, Thai and English content, all reachable states, and resource cleanup. Run frontend format, lint, type-check, tests, and production build.
