#!/usr/bin/env bash
set -euo pipefail

ISSUE_PATH="${RALPH_ISSUE_PATH:-local/issues/issue-4-001-build-teacher-host-form-setup-flow.md}"
MAX_ITERATIONS="${1:-}"
COMPLETION_SIGIL="<promise>COMPLETE</promise>"

usage() {
  echo "Usage: $0 [iterations]"
  echo
  echo "Runs one fresh Codex Ralph iteration per unchecked acceptance criterion in:"
  echo "  $ISSUE_PATH"
  echo
  echo "Set RALPH_ISSUE_PATH to target a different local issue file."
}

count_unchecked_criteria() {
  grep -c -- '^- \[ \]' "$ISSUE_PATH" || true
}

ensure_clean_worktree() {
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Working tree has uncommitted changes. Commit or stash them before running AFK Ralph." >&2
    echo "This keeps the per-iteration commits focused on the criterion Ralph just completed." >&2
    exit 1
  fi
}

if [[ "${MAX_ITERATIONS}" == "-h" || "${MAX_ITERATIONS}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ ! -f "$ISSUE_PATH" ]]; then
  echo "Local issue file not found: $ISSUE_PATH" >&2
  exit 1
fi

if [[ -z "$MAX_ITERATIONS" ]]; then
  MAX_ITERATIONS="$(count_unchecked_criteria)"
fi

if ! [[ "$MAX_ITERATIONS" =~ ^[0-9]+$ ]]; then
  echo "Iterations must be a non-negative integer." >&2
  usage >&2
  exit 1
fi

if [[ "$MAX_ITERATIONS" -eq 0 ]]; then
  echo "No iterations requested."
  exit 0
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ -z "$CURRENT_BRANCH" ]]; then
  echo "AFK Ralph requires a named branch, but Git is currently detached." >&2
  echo "Switch to a branch before running this script." >&2
  exit 1
fi
echo "AFK Ralph will commit successful iterations to the current branch: $CURRENT_BRANCH"

ensure_clean_worktree

for ((i = 1; i <= MAX_ITERATIONS; i++)); do
  unchecked_before="$(count_unchecked_criteria)"

  if [[ "$unchecked_before" -eq 0 ]]; then
    echo "All acceptance criteria are complete before iteration $i."
    echo "$COMPLETION_SIGIL"
    exit 0
  fi

  echo "Starting AFK Ralph iteration $i/$MAX_ITERATIONS for $ISSUE_PATH"

  result="$(
    codex -a on-request exec \
      -C "$PWD" \
      -s danger-full-access \
      "$(cat <<PROMPT
You are a fresh AFK Ralph agent. This is iteration $i of $MAX_ITERATIONS.

You are working on local issue file: $ISSUE_PATH

Read these files first:
- AGENTS.md
- CONTEXT-MAP.md
- client/CONTEXT.md
- server/CONTEXT.md
- docs/adr/0001-client-server-v1-stack.md
- docs/adr/0002-realtime-session-contracts.md
- PRD.md
- progress.txt
- $ISSUE_PATH

Use inspiration from Ralph:
- Work in one small loop.
- Pick one incomplete task.
- Implement it.
- Verify it.
- Record progress.
- Stop.

Rules:
1. Work only on the local issue file named above.
2. Pick exactly one unchecked acceptance criterion from that issue.
3. Implement only that criterion.
4. Prefer the topmost unchecked acceptance criterion unless another unchecked criterion clearly unlocks it.
5. Keep changes small and focused: one logical change per iteration.
6. If the selected criterion is blocked, do not mark it complete. Update progress.txt with the blocker and stop.
7. Use the existing root npm workspace with client, server, and shared packages.
8. For this issue, stay at the local `/teacher` host form boundary: render the form, validate it locally, and control the disabled/enabled **Host activity** state.
9. Do not create a **Classroom Activity**, generate a **Join Code**, wire host commands to the **Realtime Connection**, or implement hosted teacher/student routes unless the selected criterion directly requires a tiny local UI support slice.
10. Do not add authentication.
11. Do not add a database.
12. Do not add Docker, Docker Compose, dev containers, or container-specific scripts.
13. Run the most relevant verification command for the selected criterion.
14. Do not mark the criterion complete unless relevant verification passes.
15. Mark the completed criterion as done in the local issue by changing that exact checkbox from [ ] to [x].
16. If all criteria in the local issue are complete, mark the matching item complete in PRD.md if such an item exists.
17. Update progress.txt with the current issue, the selected criterion, what changed, key decisions, blockers, files changed, verification run, and recommended next criterion.
18. Do not commit. This AFK wrapper script commits after your iteration.
19. Stay inside this repository. Do not read, write, or modify files outside the repo unless explicitly asked.
20. Do not push to GitHub, merge branches, close GitHub issues, or modify GitHub issues.

Quality bar:
- Production-oriented TypeScript and React.
- Use domain language from client/CONTEXT.md and server/CONTEXT.md.
- Prefer small local helpers for **Character Name** validation over adding schema validation libraries.
- Keep `/teacher` copy calm, teacher-facing, and consistent with the issue.
- Keep the host form desktop-focused and provide a clear unsupported-width state for small screens.
- Add or update focused client tests for the selected host form behavior.
- Fight entropy. Leave the codebase better than you found it.

If all acceptance criteria are already complete, output $COMPLETION_SIGIL.

At the end, summarize:
- local issue and criterion completed
- files changed
- verification result
- recommended next criterion
PROMPT
)"
  )"

  echo "$result"

  if [[ "$result" == *"$COMPLETION_SIGIL"* ]]; then
    echo "Issue complete after $i iteration(s)."
    exit 0
  fi

  unchecked_after="$(count_unchecked_criteria)"

  if [[ "$unchecked_after" -ge "$unchecked_before" ]]; then
    echo "Iteration $i did not mark an acceptance criterion complete. Leaving changes uncommitted for review." >&2
    exit 1
  fi

  if git diff --quiet && git diff --cached --quiet; then
    echo "Iteration $i marked progress but produced no git diff. Nothing to commit." >&2
    exit 1
  fi

  git add -A

  criterion="$(git diff --cached -- "$ISSUE_PATH" | sed -n 's/^+[-] \[x\] //p' | head -n 1)"
  if [[ -z "$criterion" ]]; then
    criterion="acceptance criterion $((unchecked_before - unchecked_after))"
  fi

  git commit -m "Complete Ralph criterion: $criterion"

  echo "Committed iteration $i on $CURRENT_BRANCH."
done

remaining="$(count_unchecked_criteria)"
if [[ "$remaining" -eq 0 ]]; then
  echo "All acceptance criteria are complete."
  echo "$COMPLETION_SIGIL"
else
  echo "Stopped after $MAX_ITERATIONS iteration(s). $remaining acceptance criteria remain."
fi
