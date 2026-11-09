# Plan 0001-transactions-summary: transaction list with filters, pagination and summary
SPEC: [SPEC-0001-transactions-summary](../specs/SPEC-0001-transactions-summary.md) · Branch: `feat/transactions-summary` · Made in plan mode on 2026-11-09
<!-- Approved by the human 2026-11-09 after one edit (added the example client workflow). -->

## Context
SPEC-0001 is approved (commit `f57bd3c`). The scaffold, CI, hooks and reviewer subagent are in place on `feat/transactions-summary` (`2090dfc`, `6aa0d1a`, `eb98680`); the app is a heading plus seed data (`src/data/transactions.json`, type in `src/domain/transaction.ts`). This plan builds the feature test-first and ends with a PR whose description shows red→green output, a Playwright screenshot and review findings.

## Design (short)
- **Domain (pure functions, `src/domain/`)** — all money in integer cents:
  - `money.ts`: `formatCents(cents) → "$1,234.56"`; `parseDollars(text) → { ok, cents } | { ok: false, error }` (rejects non-numbers, negatives, >2 decimals).
  - `summary.ts`: `summarize(txns) → { processedTotalCents, feeCents, surchargeCents, processedCount }`; processed only; total = amount + surcharge.
  - `filters.ts`: `validateFilters(raw) → { ok, criteria } | { ok: false, errors: { amount?, date? } }` (min > max, bad/unreal dates, to < from); `applyFilters(txns, criteria)` (status, inclusive date and amount bounds on `amountCents`, empty bound = unbounded); `sortNewestFirst`.
  - `paginate.ts`: `paginate(items, page, size = 10) → { rows, page, pageCount }`.
- **Data edge (`src/data/seed.ts`)**: parse the JSON into `Transaction[]`, throwing with the record id if a field is wrong (never trust JSON types).
- **UI (`src/App.tsx` + `src/components/`)**: `Filters` (status select, from/to date inputs, min/max text inputs, each with a `<label>`; errors in `role="alert"` linked by `aria-describedby`), `TransactionTable`, `Summary` (a `<dl>`, so tests read values by label), `Pagination` (Previous / Next, "Page 1 of 3"). Filters apply on change, no Apply button. State: raw inputs, **last valid criteria**, page. Valid change → new criteria, page 1. Invalid → show the error, keep the last valid criteria (so list and summary don't change).
- **Example client workflow (component terms):**
  1. The user opens the page. `App` loads `seed.ts`, sorts newest first, and renders `Filters` (all empty, status "all"), `Summary` (processed total, fees, surcharge, count for all 30 transactions), `TransactionTable` (rows 1–10) and `Pagination` ("Page 1 of 3").
  2. In `Filters` they set status to "processed". `App` validates (ok), saves the new criteria, resets to page 1; `TransactionTable` shows the first 10 processed rows, `Pagination` shows "Page 1 of 2", and `Summary` covers all processed rows across both pages.
  3. They click Next in `Pagination`: `TransactionTable` shows rows 11–18; `Summary` doesn't change (it covers the whole filtered set, not the page).
  4. In `Filters` they type min `100` and max `25`. `validateFilters` returns an amount error; `Filters` shows "Minimum amount can't be more than maximum" next to the amount inputs. `App` keeps the last valid criteria, so `TransactionTable`, `Pagination` and `Summary` stay exactly as they were.
  5. They change max to `200`. Validation passes, the error disappears, the criteria update, and the view returns to page 1 with the matching rows and a new `Summary`.
  6. They set a date range no transaction falls in. `TransactionTable` shows "No transactions match these filters", `Summary` shows $0.00 / 0, and `Pagination` is hidden.

## Steps
### Claude does, you oversee
- [ ] 1. **Red (unit):** write `summary.test.ts`, `filters.test.ts`, `money.test.ts`, `paginate.test.ts` with inline fixtures whose totals you can check by hand, one test per "Done when" unit line and one `rejects …` case per invalid input. Domain files exist only as typed stubs that `throw new Error('not implemented')`, so tests fail on behaviour, not on imports. Run `npm test`; save output to `docs/build-log/0001-transactions-summary/red-unit.txt`. Commit as the red commit.
- [ ] 2. **Green (unit):** implement the four domain modules and `seed.ts`. Run `npm test`; save `green-unit.txt`. Lint and typecheck pass. Commit.
- [ ] 3. **Red (e2e):** write `e2e/transactions.spec.ts`, one test per e2e "Done when" line (paginate, summary follows filters, empty result, invalid amount range, invalid date range). Expected values are computed in the test from the seed file with the domain functions, never typed by hand. Run against the heading-only app; save `red-e2e.txt`. Commit.
- [ ] 4. **Green (UI):** build the components and App state above. Run `npm run e2e`; save `green-e2e.txt`. The invalid-amount test saves a screenshot to `docs/build-log/0001-transactions-summary/invalid-amount-range.png`; the summary test saves `summary-filtered.png`. Remove the scaffold smoke tests if the new tests cover them. Commit.
- [ ] 5. **Clean-context review:** run the reviewer subagent (`.claude/agents/reviewer.md`) on `git diff main...HEAD` against SPEC-0001, with no other context. Fix blockers and should-fixes (each fix test-first if it changes behaviour); list the rest with reasons. Save findings to `review.md` in the same folder. Commit.
- [ ] 6. **Show you the push and PR commands** (`git push -u origin feat/transactions-summary`, `gh pr create … --body-file …`) with the PR body filled from `docs/templates/PR.md`: SPEC link, Done-when → test table, red→green output, screenshot, review findings. Run them only after your yes. Report the CI run link; fix until green.
- [ ] 7. `docs/build-log/0001-transactions-summary.md`: plan, dead ends (oxlint/TS 7 → ADR 0004), final shape, what to watch. Any rule from a correction you made twice → `CLAUDE.md`. Update `docs/handoffs/handoff-transactions-summary.md`.

### You do by hand
- [ ] 8. Read the full diff on GitHub; be able to explain every line. Merge only after CI is green and your review.

## Files expected to change
- New: `src/domain/{money,summary,filters,paginate}.ts` + `.test.ts`, `src/data/seed.ts`, `src/components/{Filters,TransactionTable,Summary,Pagination}.tsx`, `e2e/transactions.spec.ts`, `docs/build-log/0001-transactions-summary.md` and folder (red/green output, screenshots, review).
- Changed: `src/App.tsx`, possibly `src/index.css` (new, minimal), `CLAUDE.md` (only if a rule is earned), `docs/handoffs/`.

## Verification
- Locally: `npm run lint`, `npm run typecheck`, `npm test`, `npm run e2e` all pass; open `npm run dev` and try min > max and a reversed date range by hand.
- Every SPEC "Done when" line maps to a named passing test (table in the PR).
- CI run on the PR is green for all four checks.

## Risks / cut first if behind
Pagination → build log (write it after the interview) → second Playwright error path (invalid date range). Never cut: the failing test first, the visible validation error, CI green, your diff read.

## Side quests seen
- `npm audit`: moderate advisories in ESLint's dev-only tree (noted in ADR 0004); not fixed here.
