# runbooks

Deploy, roll back, known failures: one file per procedure, written as numbered steps someone can follow under pressure. Nothing is deployed yet.

## Known failures
- **CI e2e fails with "browser not found"** — the workflow's `npx playwright install --with-deps chromium` step was skipped or failed; rerun the job. Locally: `npx playwright install chromium`.
- **A Claude Code session refuses `git push`** — expected when the target is `main` (`.claude/hooks/guard-push-main.sh`). Push the `feat/` branch instead.
