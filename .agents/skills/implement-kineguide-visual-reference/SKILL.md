---
name: implement-kineguide-visual-reference
description: Translate an attached screenshot, mockup, Figma design, or other approved visual reference into KineGuide AI React and Tailwind code while preserving accessibility, responsive behavior, localization, privacy, and existing application contracts. Use only when a real visual reference is provided or explicitly identified.
---

# Implement KineGuide Visual Reference

Convert visual intent into maintainable KineGuide code without treating a static reference as permission to copy inaccessible, unsafe, or framework-incompatible behavior.

## Workflow

1. Read `AGENTS.md`, `.agent/rules/web.md`, `web-design.md`, `web-accessibility.md`, and `packages/ui/DESIGN_TOKENS.md`.
2. Inspect every supplied reference at the highest useful detail. If the source is Figma or an image, follow the applicable tool prerequisite before extracting design context.
3. Inventory layout regions, hierarchy, typography, semantic colors, spacing, components, interaction states, assets, responsive clues, and visible copy.
4. Separate evidence from inference. Ask only when an ambiguity changes the user journey, safety language, asset rights, or application contract; otherwise use the established KineGuide pattern.
5. Map reference elements to existing routes, features, components, tokens, Lucide icons, translations, and API states before creating new primitives.
6. Implement natural responsive behavior rather than fixed screenshot coordinates. Preserve semantic HTML, keyboard flow, zoom, reduced motion, and Thai text expansion.
7. Preserve existing application behavior unless the user explicitly requests a behavior change. Do not infer backend endpoints from a visual.
8. Compare the rendered result at representative widths, then run frontend format, lint, type-check, tests, and build.

## Translation rules

- Match hierarchy, rhythm, proportion, and interaction intent before decorative details.
- Reuse semantic KineGuide tokens instead of copying arbitrary color or spacing values.
- Use real approved assets when available. Do not invent logos, clinical illustrations, claims, patient photos, or external asset licenses.
- Keep all raw camera media in the browser and never reproduce identifiable health data from a reference in fixtures or source code.
- Add Thai copy first and an English translation in the same change.
- Add loading, empty, degraded, permission, error, low-confidence, and retry states even when the static reference omits them.

## Verification

Check visual hierarchy, responsive layout, overflow, keyboard focus, accessible names, contrast, touch targets, reduced motion, Thai and English content, network behavior, and state coverage. Document any deliberate deviation from the reference and why it protects usability, safety, privacy, or maintainability.
