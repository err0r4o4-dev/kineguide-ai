# GitHub workflow

The permanent branches are `main` and `develop`:

```text
main
└── develop
    ├── feature/<issue-number>-<name>
    ├── fix/<issue-number>-<name>
    └── docs/<issue-number>-<name>
```

## Development process

```text
Create Issue
→ Create branch from develop
→ Implement and test
→ Push branch
→ Open Pull Request into develop
→ Teammate review
→ Merge
→ Automatically close Issue
→ Delete feature branch
```

Every pull request must link its issue with `Closes #<issue-number>`, receive one teammate approval, resolve conversations, and pass required CI checks.

## Release process

```text
develop
→ Full test
→ Pull Request into main
→ Review
→ Merge
→ Create release tag
```

Use semantic release tags such as `v0.1.0`, `v0.2.0`, and `v1.0.0`. Do not create a release tag during repository setup.

Protect `main` and `develop`, block force pushes and deletion, require pull requests and one approval, and automatically delete merged head branches. Do not create `CODEOWNERS` until both team GitHub usernames are confirmed.
