# GitHub workflow

The permanent branches are `main` and `develop`. Create `feature/<issue-number>-<short-name>`, `fix/<issue-number>-<short-name>`, or `docs/<issue-number>-<short-name>` from `develop`; open the pull request into `develop`; require one teammate approval and successful CI; then delete the merged branch. Promote `develop` to `main` only for a verified release.

Configure these settings manually after the repository owner and remote are known:

1. Protect `main` and `develop`.
2. Require pull requests and one approval.
3. Require all CI status checks.
4. Block force pushes and branch deletion.
5. Enable automatic deletion of merged feature branches.

Do not create `CODEOWNERS` until team GitHub usernames are confirmed.
