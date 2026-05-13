#!/usr/bin/env bash
set -euo pipefail

codex -a on-request exec \
  -C "$PWD" \
  -s danger-full-access \
  "$(cat <<'PROMPT'
You are working on GitHub issue #3: Shared Realtime Contracts And Activity Foundation.

Read these files first:
- AGENTS.md
- CONTEXT-MAP.md
- client/CONTEXT.md
- server/CONTEXT.md
- docs/adr/0001-client-server-v1-stack.md
- docs/adr/0002-realtime-session-contracts.md
- PRD.md
- progress.txt

Work like a human-in-the-loop Ralph iteration.

Rules:
1. Pick exactly one unchecked task from PRD.md.
2. Implement only that task.
3. Prefer the task with the highest architectural risk or the task that unlocks the most future work.
4. Keep changes small and focused: one logical change per iteration.
5. If a task feels too large, do the smallest useful slice and update PRD.md/progress.txt honestly.
6. Use the existing root npm workspace with `client` and `server` packages.
7. Introduce shared contracts in a workspace package named `@frempower/shared`.
8. Keep server activity/domain logic separate from Socket.IO handlers.
9. Do not implement the full host, join, pairing, or chat UI flows yet.
10. Do not add authentication.
11. Do not add a database.
12. Do not add Docker, Docker Compose, dev containers, or container-specific scripts.
13. Run the most relevant verification command for the task.
14. Do not mark the task complete unless the relevant verification passes, or progress.txt clearly records the blocker.
15. Mark the completed task as done in PRD.md by changing its checkbox from `[ ]` to `[x]`.
16. Update progress.txt with what changed, key decisions, blockers, files changed, and verification run.
17. Do not commit. Leave the diff for software engineering author review.
18. Stay inside this repository. Do not read, write, or modify files outside the repo unless explicitly asked.
19. Do not automatically push this branch to GitHub, merge it into git Main, or close the related GitHub issue unless the software engineering author explicitly confirms that behavior.

Quality bar:
- Production-oriented TypeScript.
- Use domain language from client/CONTEXT.md and server/CONTEXT.md.
- Prefer plain runtime helpers over adding schema validation libraries.
- Prefer deterministic tests for clock, random, and Join Code behavior.
- Fight entropy. Leave the codebase better than you found it.

At the end, summarize:
- task completed
- files changed
- verification result
- recommended next task
PROMPT
)"
