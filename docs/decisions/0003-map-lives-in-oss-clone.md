# 0003 — The OSS architecture map lives in the OSS clone
Date: 2026-11-09 · Status: accepted

## Context
Part of the practice is mapping an existing mid-size open-source React + TypeScript app: its architecture, data flow, test setup and CI, with every claim checked against the code. That map has to sit somewhere. This repo provides the reusable template for it ([../templates/architecture-map.md](../templates/architecture-map.md)).

## Options considered
1. In this repo, e.g. `docs/context/<app>-architecture.md` — all docs in one place / the map describes code that isn't here, so file-path citations can't be clicked or checked, and it goes stale against a repo it doesn't track.
2. In the OSS clone, at `docs/architecture.md` on the author's fork — sits next to the code it cites, versioned with the fork, travels with the fix branch / one more place to look.

## Decision
Option 2. The map lives in the OSS clone's `docs/architecture.md`. This repo keeps only the template; `docs/context/` describes the ledger itself.

## Consequences
- Every claim in the map can be checked against code in the same checkout.
- `docs/context/` here never holds facts about another codebase.
- If the template changes, maps already written are not updated retroactively.
