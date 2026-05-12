#!/usr/bin/env bash
set -euo pipefail

codex -a on-request exec \
  -C "$PWD" \
  -s danger-full-access \
  "$(cat <<'PROMPT'
You are working on GitHub issue #2: Scaffold V1 App Shell.

Read these files first:
- AGENTS.md
- CONTEXT-MAP.md
- client/CONTEXT.md
- server/CONTEXT.md
- docs/adr/0001-client-server-v1-stack.md
- PRD.md
- progress.txt

Work like a human-in-the-loop Ralph iteration.

Rules:
1. Pick exactly one unchecked task from PRD.md.
2. Implement only that task.
3. Use a root npm workspace with `client` and `server` packages.
4. Prefer boring, known-working setup choices.
5. Do not implement future issue behavior.
6. Do not add authentication.
7. Do not add a database.
8. Do not add Docker, Docker Compose, dev containers, or container-specific scripts.
9. Run the most relevant verification command for the task.
10. Update progress.txt with what changed and what verification ran.
11. Do not commit. Leave the diff for human review.
12. Stay inside this repository. Do not read, write, or modify files outside the repo unless explicitly asked.

At the end, summarize:
- task completed
- files changed
- verification result
- recommended next task
PROMPT
)"
