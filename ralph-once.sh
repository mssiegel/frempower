#!/usr/bin/env bash
set -euo pipefail

ISSUE_PATH="${RALPH_ISSUE_PATH:-}"

if [[ -z "$ISSUE_PATH" ]]; then
  ISSUE_PATH="$(
    find local/issues -maxdepth 1 -type f -name '[0-9][0-9][0-9]-*.md' \
      | sort \
      | while IFS= read -r candidate; do
          if grep -q -- '- \[ \]' "$candidate"; then
            printf '%s\n' "$candidate"
            break
          fi
        done
  )"
fi

if [[ -z "$ISSUE_PATH" ]]; then
  echo "No unchecked local issues found under local/issues."
  exit 0
fi

if [[ ! -f "$ISSUE_PATH" ]]; then
  echo "Local issue file not found: $ISSUE_PATH" >&2
  exit 1
fi

codex -a on-request exec \
  -C "$PWD" \
  -s danger-full-access \
  "$(cat <<PROMPT
You are working on local issue file: $ISSUE_PATH

Read these files first:
- AGENTS.md
- CONTEXT-MAP.md
- client/CONTEXT.md
- server/CONTEXT.md
- docs/adr/0001-client-server-v1-stack.md
- docs/adr/0002-realtime-session-contracts.md
- docs/current-codebase-socketio-implementation-plan.md
- PRD.md
- progress.txt
- $ISSUE_PATH

Work like a human-in-the-loop Ralph iteration.

Rules:
1. Work only on the local issue file named above.
2. Pick exactly one unchecked acceptance criterion from that issue.
3. Implement only that criterion.
4. Prefer the criterion with the highest architectural risk or the criterion that unlocks the most future work.
5. Keep changes small and focused: one logical change per iteration.
6. If a criterion feels too large, do the smallest useful slice and update the issue file, PRD.md, and progress.txt honestly.
7. Use the existing root npm workspace with client, server, and shared packages.
8. Keep server activity/domain logic separate from Socket.IO handlers.
9. Do not implement unrelated host, join, pairing, or chat product flows unless the selected local issue criterion directly requires a small supporting slice.
10. Do not add authentication.
11. Do not add a database.
12. Do not add Docker, Docker Compose, dev containers, or container-specific scripts.
13. Run the most relevant verification command for the selected criterion.
14. Do not mark the criterion complete unless the relevant verification passes, or progress.txt clearly records the blocker.
15. Mark the completed criterion as done in the local issue by changing its checkbox from [ ] to [x].
16. If all criteria in the local issue are complete, mark the matching item complete in PRD.md.
17. Update progress.txt with the current issue, what changed, key decisions, blockers, files changed, verification run, and recommended next local issue or criterion.
18. Do not commit. Leave the diff for software engineering author review.
19. Stay inside this repository. Do not read, write, or modify files outside the repo unless explicitly asked.
20. Do not automatically push this branch to GitHub, merge it into git Main, close GitHub issues, or modify GitHub issues.

Quality bar:
- Production-oriented TypeScript.
- Use domain language from client/CONTEXT.md and server/CONTEXT.md.
- Prefer plain runtime helpers over adding schema validation libraries.
- Prefer deterministic tests for connection, routing, clock, random, and Join Code behavior.
- Fight entropy. Leave the codebase better than you found it.

At the end, summarize:
- local issue and criterion completed
- files changed
- verification result
- recommended next local issue or criterion
PROMPT
)"
