#!/usr/bin/env bash
# PreToolUse (Bash): block any git push that targets main.
# Backs up the deny rules in settings.json, which only match exact command shapes.
set -euo pipefail
cmd=$(jq -r '.tool_input.command // ""')
[[ "$cmd" =~ git[[:space:]]+push ]] || exit 0

reason=""
if [[ "$cmd" =~ (^|[[:space:]:+])main([[:space:]]|$) ]]; then
  reason="the command names main as a push target"
elif [[ "$cmd" =~ --all|--mirror ]]; then
  reason="--all/--mirror would push main"
elif [[ "$(git -C "${CLAUDE_PROJECT_DIR:-.}" branch --show-current 2>/dev/null)" == "main" ]]; then
  reason="the current branch is main"
fi

if [[ -n "$reason" ]]; then
  echo "Blocked: pushing to main is not allowed ($reason). Push a feat/ branch and open a PR instead (CLAUDE.md, ADR 0002)." >&2
  exit 2
fi
