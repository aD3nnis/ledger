#!/usr/bin/env bash
# PostToolUse (Edit|Write|MultiEdit): lint the edited file and typecheck the project.
# Exit 2 feeds the errors back to Claude so it fixes them before moving on.
set -uo pipefail
file=$(jq -r '.tool_input.file_path // ""')
[[ "$file" =~ \.(ts|tsx|js)$ ]] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

out=$(npx --no-install eslint --max-warnings 0 "$file" 2>&1) || { echo "ESLint failed for $file:" >&2; echo "$out" >&2; exit 2; }
out=$(npm run -s typecheck 2>&1) || { echo "Typecheck failed:" >&2; echo "$out" | tail -40 >&2; exit 2; }
exit 0
