---
trigger: model_decision
description: Apply when creating or redesigning KineGuide pages, components, layouts, visual styles, responsive behavior, interactions, copy, or localization.
---

# Web design rule

Use `$design-kineguide-web`. Also use `$implement-kineguide-visual-reference` only when an actual reference is supplied.

- Read `packages/ui/DESIGN_TOKENS.md`, the current global styles, related routes, and reusable components before designing.
- Preserve the healthcare-support tone: calm, direct, non-judgmental, and honest about uncertainty. Visual polish must not weaken clarity or safety.
- Use semantic tokens, the established slate and teal direction, a 4 px spacing rhythm, consistent typography, and Lucide icons already installed.
- Avoid generic card grids, decorative gradients, excessive pills, emoji icons, arbitrary shadows, and animation that does not communicate state.
- Design mobile-first from 320 px and verify 320, 768, 1024, and 1440 px without horizontal scrolling or hidden fixed content.
- Provide visible hover, focus, active, disabled, loading, empty, success, degraded, offline, and error behavior when reachable.
- Default to Thai. Add matching English keys in the same change and keep user-facing strings out of components.
- Use plain, specific health language. Do not claim diagnosis, guaranteed recovery, clinical effectiveness, or regulatory compliance.
- Respect reduced motion and keep urgent stop, pain, consent, and escalation information visually dominant.
