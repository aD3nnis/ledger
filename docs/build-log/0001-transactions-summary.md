# Build log 0001: transactions summary
SPEC: [SPEC-0001](../specs/SPEC-0001-transactions-summary.md) · Plan: [plan-0001](../plans/plan-0001-transactions-summary.md) · PR: https://github.com/aD3nnis/ledger/pull/1 · Evidence: [0001-transactions-summary/](0001-transactions-summary/)

## Plan
1. Interview the product owner into a SPEC, asking the domain unknowns instead of guessing:
   - Does the processed total include the surcharge? Yes.
   - Is money in cents? Yes, integers per transaction.
   - Which statuses count? Processed only.
   - What happens on invalid filters? A visible error, and the last valid results stay.
   - What's the page size? 10.
2. Scaffold, CI, hooks and the reviewer subagent.
3. Plan mode. The human added an example client workflow before approving.
4. Unit tests red, then green. Browser tests red, then green.
5. Clean-context review, with the fixes made test-first.
6. PR.

## Dead ends
- **Template tooling.** `npm create vite` now ships oxlint and TypeScript 7. typescript-eslint supports TypeScript below 6.1 only, so TypeScript is pinned to 6.0 and ESLint is used, as the plan named ([ADR 0004](../decisions/0004-eslint-with-typescript-6.md)).
- **JSON in Playwright.** Importing the seed JSON failed under Playwright's Node loader ("needs an import attribute"). Fixed with `with { type: 'json' }`, which Vite and TypeScript also accept.
- **Stub signatures.** `void param` in the stubs broke lint (`no-meaningless-void-operator`). Switched to `_param` names and allowed them in the ESLint config.
- **Date inputs.** `type="date"` reports impossible dates like 2026-02-30 as blank, so the SPEC's "not a real date" error could never show, and the bound was dropped silently. The reviewer caught it. Fixed with text inputs and a `YYYY-MM-DD` hint.
- **Test oracle.** The first browser tests computed their expected values with the app's own domain functions, so a domain bug could pass both. The reviewer caught it. Fixed with an oracle written in the test file that reads the raw seed.

## Final shape
- **`src/domain/`:** pure functions, all money in integer cents.
  - `summarize`: processed only; total = amount + surcharge.
  - `validateFilters`: one message per filter group.
  - `applyFilters`: inclusive bounds; the amount bound uses `amountCents` only.
  - `parseDollars`: string arithmetic, no floats.
  - `paginate`.
- **`src/data/seed.ts`:** validates the seed JSON when it loads and names any bad record.
- **`src/App.tsx`:** keeps the raw inputs, the last valid criteria and the page. Valid input replaces the criteria and resets to page 1. Invalid input only shows the error.
- **Components:** `Filters` (errors in polite live regions, `aria-invalid`), `Summary` (a `<dl>` whose values are labelled by their `<dt>`), `TransactionTable`, `Pagination`.
- **Tests:** 38 unit tests (Vitest) and 6 browser tests (Playwright), plus 2 screenshots.

## What to watch
- **Status during an error.** While an amount or date error is showing, changing Status updates the dropdown but not the list, because of the "keep last valid results" rule. Ask the product owner whether Status should still apply when another filter is invalid.
- **Both amount fields marked invalid.** One bad amount bound marks both amount inputs `aria-invalid`. Per-field errors are a follow-up.
- **Screenshots rewritten.** `npm run e2e` rewrites the evidence screenshots in `docs/build-log/0001-transactions-summary/`. Commit them only when the UI changes on purpose.
- **TypeScript upgrade.** Bump TypeScript to 7 together with typescript-eslint when it supports 7.
