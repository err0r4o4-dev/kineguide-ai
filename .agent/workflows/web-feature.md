---
description: Implement a focused KineGuide React feature safely from issue to verified vertical slice.
---

# Web feature workflow

1. Start from `develop` on `feature/<issue>-<name>` when Git work is authorized.
2. Read `AGENTS.md`, `.agent/rules/web.md`, matching `web-*.md` rules, the issue, related contracts, and nearby tests.
3. Define the Thai-first user journey, English translation, API boundary, reachable states, accessibility behavior, privacy impact, and pass/fail signal.
4. Reuse the existing route, feature, component, service, query, form, and token patterns.
5. Implement one testable vertical slice. Keep raw camera media in-browser and clinical behavior bounded.
6. Run the narrow test after each meaningful step.
7. Verify keyboard and responsive behavior at representative widths.
8. Run format, lint, type-check, unit tests, production build, and relevant Playwright tests.
9. Review the diff for copy, generated files, secrets, debug output, resource cleanup, and unrelated edits.
10. Report behavior, evidence, limitations, and safety/privacy implications.
