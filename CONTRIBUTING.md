# Contributing to KineGuide AI

## Branch and review workflow

```text
main
└── develop
    └── feature/<issue-number>-<short-name>
```

Create feature branches from `develop` and open pull requests back into `develop`. Examples include `feature/12-red-flag-screening`, `feature/18-camera-calibration`, `feature/24-pose-detection`, `fix/31-camera-permission`, and `docs/40-update-architecture`.

- Never push directly to `main`.
- Require review by the other team member and passing CI.
- Merge `develop` into `main` only for verified releases.
- Delete feature branches after merge.
- Keep pull requests small, focused, and linked to an issue.
- Include `Closes #<issue-number>` in the pull request description.

Use Conventional Commits, for example: `feat(web): add symptom assessment page`, `feat(api): add safety screening endpoint`, `feat(ai): extract Thai symptoms`, `fix(pose): stop camera tracks`, `test(api): add health endpoint tests`, `docs: update setup instructions`, or `chore: update dependencies`.

Before opening a pull request, run the relevant lint, type-check, test, and build commands from the root README. Never add real health information, secrets, raw camera media, unlicensed clinical material, datasets, or model artifacts.

`CODEOWNERS` is intentionally absent because GitHub usernames are unknown. Add `.github/CODEOWNERS` only after both owners confirm their usernames and review responsibilities.
