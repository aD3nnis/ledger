# 0004 — ESLint with TypeScript 6.0, not the template's oxlint with TypeScript 7
Date: 2026-11-09 · Status: accepted

## Context
`npm create vite@latest` (react-ts, Vite 8) now ships oxlint as its linter and TypeScript 7. The plan for SPEC-0001 and the team's standards name ESLint (with typescript-eslint's type-aware rules, e.g. `no-explicit-any`) for the PostToolUse hook and CI. typescript-eslint 8.72 supports TypeScript `>=4.8.4 <6.1.0`, so it can't run on TypeScript 7.

## Options considered
1. Keep the template: oxlint + TypeScript 7 — fastest tooling, newest compiler / no type-aware lint rules equivalent to typescript-eslint's strict set; departs from the plan.
2. ESLint + typescript-eslint, TypeScript pinned to `~6.0` — the stack the plan and standards name, type-aware rules work / one compiler version behind.
3. ESLint + TypeScript 7 with an unsupported peer range — works until it doesn't; silent breakage risk.

## Decision
Option 2: ESLint 10 with `typescript-eslint` `strictTypeChecked` and `react-hooks`, TypeScript pinned to `~6.0.3`.

## Consequences
- Lint can enforce no `any` and other type-aware rules in the hook and in CI.
- Revisit when typescript-eslint supports TypeScript 7: bump both together in one PR.
- `npm audit` reports moderate advisories in ESLint's dev-only dependency tree (minimatch); production dependencies have none. Revisit with the next ESLint release.
