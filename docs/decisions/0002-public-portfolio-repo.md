# 0002 — Public portfolio repo
Date: 2026-11-09 · Status: accepted

## Context
The ledger exists to practise and show a disciplined Claude Code workflow: specs, plans, ADRs, failing tests first, end-to-end tests with screenshots, CI, reviewed PRs. That evidence is only useful if someone else can read it. The author's planning notes (career, applications, private material) live elsewhere and must not leak into the code.

## Options considered
1. Private repo, shared on request — safe / reviewers can't browse it, CI history is hidden.
2. Public repo on GitHub — anyone can read the specs, PRs and CI runs / everything committed is published, so nothing private may ever enter it.
3. Public mirror of a private repo — control over what is shown / two repos to keep in sync, and the history shown is not the real one.

## Decision
Option 2: `ledger` is a public GitHub repository under the MIT license. All work lands through branches and pull requests so the history itself is the evidence; `main` is pushed directly only once, for the initial skeleton.

## Consequences
- No secrets, credentials, personal data or real customer data, ever. Seed data is invented. `.env*` is git-ignored.
- Nothing is copied in from the author's private planning notes; this repo has its own templates (see [../templates/](../templates/)).
- After the skeleton commit, `main` changes only through PRs. A deny rule for pushes to `main` is added in `.claude/settings.json` with the first feature.
