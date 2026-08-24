---
trigger: model_decision
description: Apply to any behavior change, bug fix, refactor, dependency update, or test modification.
---

# Testing and quality rule

- Define the observable pass/fail signal before implementation.
- For bugs and behavior changes, write a failing regression test first when a reliable seam exists.
- Do not delete, skip, weaken, or over-mock tests merely to make checks pass.
- Run narrow checks while iterating and the complete affected workspace suite before completion.
- Validate integration boundaries for cross-service changes and report checks exactly as executed.
