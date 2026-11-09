# SPEC-0001-transactions-summary: transaction list with filters, pagination and a processed-total summary
Status: approved (2026-11-09) · Started: 2026-11-09 · Branch: `feat/transactions-summary` · Plan: [plan-0001-transactions-summary](../plans/plan-0001-transactions-summary.md)

## Known
<!-- facts, each with its source. "PO" = product owner answers, 2026-11-09 -->
### Scope and data
- Front end only: React + TypeScript + Vite, reading invented seed JSON. No API or database in this ticket. Source: project plan.
- Money is stored as **integer cents, per transaction**: `amountCents`, `feeCents`, `surchargeCents`. The UI formats cents as US dollars (`$1,234.56`) only for display. Source: PO.
- Statuses are `processed`, `pending`, `refunded`. Source: PO.

### Summary rules
- **Processed total = Σ (`amountCents` + `surchargeCents`)** over transactions with status `processed`. Fees are not subtracted. Source: PO.
- The summary shows four lines: processed total, total fees, total surcharge, processed count. All four cover `processed` transactions only; pending and refunded are listed but excluded. Source: PO.
- The summary covers the **filtered set across all pages**, not just the visible page. Source: PO.
- When nothing matches, the list says "No transactions match these filters" and every summary line shows zero. Source: PO.

### List and filters
- Filters: status (processed / pending / refunded / all), date range (from, to), amount range (min, max, in dollars). Source: PO.
- The amount filter compares against `amountCents` only (not amount + surcharge). Source: PO.
- All bounds are inclusive; an empty bound means unbounded. Source: PO.
- Page size is a fixed **10** rows, with previous/next controls. Any filter change returns to page 1. Source: PO.
- The list is sorted newest first. Source: PO.

### Invalid filter input
- Invalid means: amount min > max; a negative amount; an amount that isn't a number or has more than 2 decimal places; date "to" before "from"; a date that isn't a real calendar date. Source: PO.
- On invalid input, a visible message appears next to the filter that caused it, saying what is wrong; the list and summary keep their last valid results. Source: PO (Claude's recommendation, accepted). Also [standards](../standards.md#validation).

## Unknown — must answer before plan
- None.

## Unknown
- None open. Anything found during planning goes here and waits on the PO.

## Assumed
<!-- what will be built if nobody objects -->
- Claude generates the seed data (`src/data/transactions.json`): about 30 invented transactions across all three statuses, with some on filter boundary values; obviously fake merchant names. The PO skims it in the diff. (PO chose this 2026-11-09.)
- Unit tests build their own small inline fixtures with hand-checkable totals; they don't read the seed file. End-to-end tests compute expected values from the seed file in code, not by hand.
- Dates are calendar dates (`YYYY-MM-DD`) compared without time zones.

## Out of scope
- API, database, auth, persistence of filter state across reloads.
- Editing, creating or refunding transactions.
- Multiple currencies, time zones.
- Page-size selector, sorting controls, CSV export.

## Done when
<!-- testable statements; each names the test that proves it -->
- [ ] The processed total equals Σ (amount + surcharge) over processed transactions only. — test: `src/domain/summary.test.ts` › `processed total includes surcharge, excludes pending and refunded`
- [ ] Total fees, total surcharge and processed count cover processed transactions only. — test: `src/domain/summary.test.ts` › `fees, surcharge and count use processed only`
- [ ] An empty set summarises to 0 for every line. — test: `src/domain/summary.test.ts` › `empty set`
- [ ] Each invalid filter input listed under "Invalid filter input" returns a specific error message. — test: `src/domain/filters.test.ts` › `rejects …` (one case per input)
- [ ] Filtering by status, date range and amount range returns the matching transactions, bounds inclusive. — test: `src/domain/filters.test.ts` › `applies …`
- [ ] The page shows 10 rows per page, newest first; next/previous move between pages; a filter change returns to page 1. — test: `e2e/transactions.spec.ts` › `paginates 10 per page`
- [ ] The summary on screen reflects the filtered set across all pages. — test: `e2e/transactions.spec.ts` › `summary follows filters`
- [ ] A filter that matches nothing shows "No transactions match these filters" and zeros. — test: `e2e/transactions.spec.ts` › `empty result`
- [ ] Entering min > max shows a visible error next to the amount filter, and the list and summary keep their previous values. — test: `e2e/transactions.spec.ts` › `invalid amount range shows error` (with screenshot)
- [ ] Entering a "to" date before "from" shows a visible error next to the date filter. — test: `e2e/transactions.spec.ts` › `invalid date range shows error`
- [ ] `lint`, `typecheck`, `test` and `e2e` pass in GitHub Actions on the PR.
