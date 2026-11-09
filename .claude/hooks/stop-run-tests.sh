#!/usr/bin/env bash
# Stop: run the unit tests before Claude ends its turn. Exit 2 keeps Claude working on failures.
set -uo pipefail
active=$(jq -r '.stop_hook_active // false')
[[ "$active" == "true" ]] && exit 0   # already continuing because of this hook: don't loop
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

out=$(npm test --silent 2>&1) && exit 0
# A deliberate red step (failing test first) is expected: say so instead of blocking forever.
echo "Unit tests are failing. If this is the planned red step, say so and save the output; otherwise fix them:" >&2
echo "$out" | tail -40 >&2
exit 2
