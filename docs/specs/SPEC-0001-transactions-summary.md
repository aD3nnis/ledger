# SPEC-0001-transactions-summary: transaction list with filters, pagination and a processed-total summary
Status: draft · Started: 2026-11-09 · Branch: `feat/transactions-summary` · Plan: [plan-0001-transactions-summary](../plans/plan-0001-transactions-summary.md)

## Known
<!-- facts, each with its source -->
- Scope is front end only: React + TypeScript + Vite, reading invented seed JSON. No API or database in this ticket. Source: project plan, decided 2026-11-09.
- Seed data stores money as **integer cents, per transaction**: each transaction has `amountCents`, `feeCents`, `surchargeCents`. The UI formats cents as dollars only for display. Source: product owner, 2026-11-09.
- Statuses are `processed`, `pending`, `refunded`. **Only `processed` counts** toward the summary; pending and refunded are listed but excluded. Source: product owner, 2026-11-09.
- **Processed total = Σ (`amountCents` + `surchargeCents`)** over processed transactions. Fees are not subtracted; they get their own line. Source: product owner, 2026-11-09.
- The summary shows four lines: processed total, total fees, total surcharge, processed count. All four cover processed transactions only. Source: product owner, 2026-11-09.
- The summary covers the **filtered set across all pages**, not just the visible page. Source: product owner, 2026-11-09.
- Filters: status (processed / pending / refunded / all), date range (from, to), amount range (min, max, in dollars). Source: product owner, 2026-11-09.
- Page size is a fixed **10** rows, with previous/next controls. Source: product owner, 2026-11-09.
- Errors must be visible, never silent ([standards](../standards.md#validation)). Source: repo standards.

## Unknown — must answer before plan
- None.

## Unknown
- None open. Anything found during planning goes here and waits on the product owner.

## Assumed
<!-- what will be built if nobody objects -->
- **On invalid filter input, a visible message appears next to the filter that caused it, saying what is wrong; the list and summary keep their last valid results.** (Claude's recommendation, accepted by the product owner 2026-11-09 as an assumption.)
- Invalid filter input is: amount min > max; a negative amount; an amount that isn't a number or has more than 2 decimal places; date "to" before "from"; a date that isn't a real calendar date.
- The amount filter compares against `amountCents` only (not amount + surcharge). Bounds are inclusive.
- The date filter compares calendar dates, inclusive on both ends; an empty bound means unbounded.
- Changing any filter resets the list to page 1.
- The list is sorted newest first. Currency is USD, shown as `$1,234.56`.
- Seed data has at least 25 transactions across all three statuses, so pagination shows 3 pages unfiltered.
- An empty filtered set shows "No transactions match these filters" and a summary of $0.00 / 0.

## Out of scope
- API, database, auth, persistence of filter state across reloads.
- Editing, creating or refunding transactions.
- Multiple currencies, time zones beyond the browser's local date.
- Page-size selector, sorting controls, CSV export.

## Done when
<!-- testable statements; each names the test that proves it -->
- [ ] The processed total equals Σ (amount + surcharge) over processed transactions only. — test: `src/domain/summary.test.ts` › `processed total includes surcharge, excludes pending and refunded`
- [ ] Total fees, total surcharge and processed count cover processed transactions only. — test: `src/domain/summary.test.ts` › `fees, surcharge and count use processed only`
- [ ] An empty set summarises to 0 for every line. — test: `src/domain/summary.test.ts` › `empty set`
- [ ] Each invalid filter input listed under Assumed returns a specific error message. — test: `src/domain/filters.test.ts` › `rejects …` (one case per input)
- [ ] Filtering by status, date range and amount range returns the matching transactions, bounds inclusive. — test: `src/domain/filters.test.ts` › `applies …`
- [ ] The page shows 10 rows per page, and next/previous move between pages; a filter change returns to page 1. — test: `e2e/transactions.spec.ts` › `paginates 10 per page`
- [ ] The summary on screen reflects the filtered set across all pages. — test: `e2e/transactions.spec.ts` › `summary follows filters`
- [ ] Entering min > max shows a visible error next to the amount filter, and the list and summary keep their previous values. — test: `e2e/transactions.spec.ts` › `invalid amount range shows error` (with screenshot)
- [ ] Entering a "to" date before "from" shows a visible error next to the date filter. — test: `e2e/transactions.spec.ts` › `invalid date range shows error`
- [ ] `lint`, `typecheck`, `test` and `e2e` pass in GitHub Actions on the PR.
