# ledger

A small payments ledger, built feature by feature with Claude Code to practise a spec-first, test-first workflow. This file holds repo-wide rules and commands and links to `docs/` instead of copying it. Keep it under ~200 lines.

## Where things are
| Path | Holds |
|---|---|
| [docs/standards.md](docs/standards.md) | Coding standards a linter can't check |
| [docs/context/](docs/context/) | One file per service or API: what it does, data shapes, gotchas |
| [docs/decisions/](docs/decisions/) | ADRs, `NNNN-title.md` (permanent) |
| [docs/specs/](docs/specs/) | `SPEC-<ticket>.md`: knowns, unknowns, scope, done |
| [docs/plans/](docs/plans/) | `plan-<ticket>.md`: task checklist |
| [docs/handoffs/](docs/handoffs/) | `handoff-<track>.md`: done, next, open questions |
| [docs/build-log/](docs/build-log/) | How each feature was built: plan, dead ends, final shape |
| [docs/runbooks/](docs/runbooks/) | Deploy, roll back, known failures |
| [docs/templates/](docs/templates/) | SPEC, plan, handoff, PR templates (plus ADR, architecture map) |
| `services/<name>/CLAUDE.md` | Rules for that service only, e.g. [services/payments/](services/payments/CLAUDE.md) |
| `.claude/` | `settings.json` (permissions, hooks), `commands/`, `skills/`, `agents/` |

`<ticket>` is `NNNN-<slug>` (e.g. `0001-transactions-summary`) until an issue tracker is used. `<track>` is the branch name without its prefix (`feat/transactions-summary` → `transactions-summary`).

## Commands
Node 22. React + TypeScript + Vite front end; seed data in `src/data/`.
| Command | Does | Runs in |
|---|---|---|
| `npm run dev` | Dev server on :5173 | — |
| `npm run lint` | ESLint (typescript-eslint strict, react-hooks), zero warnings | PostToolUse hook, CI |
| `npm run typecheck` | `tsc -b --noEmit`, strict mode | PostToolUse hook, CI |
| `npm test` | Vitest unit tests (`src/**/*.test.ts(x)`) | Stop hook, CI |
| `npm run e2e` | Playwright (`e2e/`), starts the dev server itself | CI |

CI: [.github/workflows/ci.yml](.github/workflows/ci.yml) runs all four on every PR and push to `main`.

Hooks ([.claude/settings.json](.claude/settings.json), scripts in `.claude/hooks/`): ESLint on the edited file + typecheck after every edit; `npm test` when Claude stops; any `git push` to `main` is blocked (deny rules + `guard-push-main.sh`). Reviewer subagent: [.claude/agents/reviewer.md](.claude/agents/reviewer.md).

## Workflow (every feature)
1. SPEC first, from `docs/templates/SPEC.md`. Ask the human the domain unknowns; never guess them.
2. Plan mode → `docs/plans/plan-<ticket>.md`. The human edits the plan before approving it.
3. Branch `feat/<track>` off `main`. Never commit or push to `main` directly.
4. Failing test first; keep the red output. Then implement until green.
5. Every SPEC "Done when" line gets a test (unit or end-to-end).
6. Review `git diff main` against the SPEC in a clean context before opening a PR.
7. PR description from `docs/templates/PR.md`, linking the SPEC and showing red→green output.
8. A decision made in a session → an ADR in `docs/decisions/` drafted then (context, options, decision, consequences).
9. End of session → update `docs/handoffs/handoff-<track>.md`.
10. At merge → `docs/build-log/<ticket>.md`: plan, dead ends, final shape, what to watch.

## Lifecycle
- **Permanent:** `CLAUDE.md`, `docs/standards.md`, `docs/context/`, `docs/decisions/`. Update them in the same PR that changes the code.
- **Per ticket:** specs and plans. Archive or delete when the ticket ships.
- **Per session:** handoffs. Delete after the track merges.
- **Monthly:** Claude lists stale or contradictory lines across these files; the human decides what goes.

## Rules
- Public repo: no secrets, credentials, personal data or real customer data. Seed data is invented.
- Each fact lives in one file; link instead of copying.
- If a tool can check a rule, put it in the tool (lint, tsconfig, hook, test), not in this file.
- If the human corrects the same thing twice, add a one-line rule here.
- After two failed corrections in a row, stop and suggest `/clear` with what was learned.
