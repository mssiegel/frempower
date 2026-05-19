# Current Codebase Socket.IO Implementation PRD

Goal: Update the current Frempower Realtime Server and Realtime Connection implementation to follow the Socket.IO best practices captured in `docs/current-codebase-socketio-implementation-plan.md`.

This PRD is intentionally scoped to the current codebase implementation. It is not a replacement for the GitHub V1 product issues. `ralph-once.sh` should use the local issue files under `local/issues/` and tackle them in numeric order.

## Source Plan

- `docs/current-codebase-socketio-implementation-plan.md`

## Known decisions

- Use Socket.IO heartbeat/ping-pong settings to detect dead realtime connections.
- Do not rely on TCP keepalive as the authority for **Teacher Disconnect** or **Student Disconnect** behavior.
- Use Socket.IO rooms for **Session ID**, teacher activity, student snapshot, and active **Pairing** delivery.
- Enforce only one live Realtime Connection per **Session ID**.
- Treat a **Session ID** as one guest session in one browser tab; Version 1 has no database-backed multi-tab or multi-device login.
- If a new socket resumes the same **Session ID**, the new socket replaces the old socket.
- Do not broadcast globally and filter by activity, student, or pairing in application logic.
- Keep authoritative activity and chat state in the activity service.
- Recover missed authoritative state through audience-specific snapshots after reconnect.
- Keep typing indicators ephemeral.
- Keep server activity/domain logic separate from Socket.IO handlers.
- Keep Ralph human-in-the-loop. `ralph-once.sh` runs one local issue criterion at a time and leaves diffs for software engineering author review.

## Local Issue Backlog

- [x] `local/issues/001-configure-realtime-heartbeat-baseline.md`
- [x] `local/issues/002-add-session-room-routing-foundation.md`
- [x] `local/issues/003-emit-realtime-updates-through-rooms.md`
- [x] `local/issues/004-recover-authoritative-state-after-reconnect.md`
- [x] `local/issues/005-add-realtime-boundary-regression-tests.md`

Current Ralph status: `local/issues/004-recover-authoritative-state-after-reconnect.md` is complete. Next iteration should start `local/issues/005-add-realtime-boundary-regression-tests.md`.

## Ralph Workflow

1. Run `./ralph-once.sh`.
2. The script selects the lowest-numbered local issue with unchecked acceptance criteria.
3. Ralph implements exactly one unchecked acceptance criterion from that issue.
4. Ralph marks that criterion complete in the local issue only after verification passes, or records the blocker in `progress.txt`.
5. When a local issue has no remaining unchecked acceptance criteria, Ralph marks the matching backlog item complete in this PRD.
6. Ralph updates `progress.txt` every iteration.
7. Ralph does not commit, push, merge, close GitHub issues, or modify GitHub issues.

## Constraints

- Do not add authentication.
- Do not add a database.
- Do not add Docker, Docker Compose, dev containers, or container-specific scripts.
- Do not implement unrelated host, join, pairing, or chat product flows.
- Do not use socket IDs as participant identity.
- Do not support multiple live browser tabs for one guest session in Version 1.
- Prefer small, reviewable diffs.
- Run the most relevant feedback loop before marking a criterion complete.
- Leave Ralph iteration diffs uncommitted for software engineering author review.

## Verification

- Run focused tests or type checks for the criterion Ralph completes.
- Before a Ralph criterion is marked complete, update the local issue file and `progress.txt`.
- Do not declare a local issue complete in this PRD until all acceptance criteria in that local issue are checked.
