# 0001 — Record architecture decisions
Date: 2026-11-09 · Status: accepted

## Context
This repo is built across many short Claude Code sessions. Each session starts with no memory of why earlier choices were made, and a reviewer reading the code later has the same problem. Choices that live only in chat or in someone's head get re-argued or silently undone.

## Options considered
1. No decision log; rely on commit messages — cheap / reasons are scattered and hard to find.
2. A single `DECISIONS.md` — one file / grows into a wall, no status per decision, merge conflicts.
3. One ADR per decision in `docs/decisions/NNNN-title.md` — easy to link, each has a status, supersede instead of rewrite / a little ceremony per decision.

## Decision
Use option 3. Any choice a future reader would question gets an ADR, drafted in the session where it is made, from [../templates/ADR.md](../templates/ADR.md): context, options considered, decision, consequences. ADRs are never renumbered or deleted; a changed mind is a new ADR that supersedes the old one.

## Consequences
- `CLAUDE.md` can stay short and link here for the "why".
- A session that makes a choice has one extra file to write. If it is skipped, the reviewer asks for it.
- Old ADRs stay as history even when superseded.
