# Review: SPEC-0001 transactions summary

The reviewer subagent ([.claude/agents/reviewer.md](../../../.claude/agents/reviewer.md)) ran in a clean context on `git diff main...HEAD` at `c194b5f`. It read only the SPEC, the diff, the standards and `CLAUDE.md`. Its verdict was **changes needed**: 0 blockers, 3 should-fixes and 6 nits. Fixes were made test-first: red at `ac65521` ([review-fixes-red.txt](review-fixes-red.txt)), then green in the commit after it.

| # | Severity | Finding | Outcome |
|---|---|---|---|
| 1 | should-fix | `type="date"` inputs report an empty value for impossible dates, so "isn't a real date" was unreachable: the bound was silently dropped. | **Fixed.** The date fields are now text inputs with a `YYYY-MM-DD` hint, and a new e2e test covers `2026-02-30`. |
| 2 | should-fix | The e2e expected values came from the app's own domain functions, and the newest-first check compared the sort function with itself. | **Fixed.** The test oracle is now written in the e2e file and reads the raw seed JSON. Newest-first is checked directly on the dates shown on screen. |
| 3 | should-fix | `role="alert"` errors interrupted screen readers on every keystroke while a range was being typed. | **Fixed.** Each error now sits in an always-rendered `aria-live="polite"` region. |
| 4 | nit | The error tests didn't check that the message is visible, or `aria-invalid` on the date field. | **Fixed.** |
| 5 | nit | One bad amount bound marks both amount inputs `aria-invalid`. | **Not fixed.** The message names the bound ("Minimum…" / "Maximum…"); per-field errors are a follow-up. |
| 6 | nit | While an error shows, changing Status updates the dropdown but not the list, which the SPEC's "keep last valid results" rule causes. | **Not fixed.** It's recorded under "what to watch" in the build log, and it's a question for the product owner. |
| 7 | nit | A huge amount loses precision as cents. | **Fixed.** Input is rejected with "is too large" past `Number.MAX_SAFE_INTEGER`, with unit tests for it. |
| 8 | nit | No test for the pending status filter. | **Fixed.** |
| 9 | nit | The PR mixes tooling (hooks, CI, ADR 0004) with the feature; `App.test.tsx` was kept. | **Kept on purpose.** The PR description lists the tooling. The heading smoke test stays because it is cheap and checks that the app renders. |
