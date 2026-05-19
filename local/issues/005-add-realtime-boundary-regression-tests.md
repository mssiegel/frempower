# Add Realtime Boundary Regression Tests

Type: AFK

## What to build

Add regression coverage around the Socket.IO best-practice behavior so future realtime feature work keeps the heartbeat, room scoping, and reconnect recovery contract intact.

This slice should focus on boundary behavior rather than exhaustive product flows. The tests should prove the current codebase enforces the rules that future host, join, pairing, chat, settings, and End Activity work will rely on.

## Acceptance criteria

- [x] Tests cover explicit heartbeat configuration.
- [x] Tests cover one **Session ID** allowing only one live socket.
- [ ] Tests cover a newer socket replacing an older socket for the same **Session ID**.
- [ ] Tests cover current-socket disconnect behavior.
- [ ] Tests cover rejoining rooms after reconnect or resume.
- [ ] Tests cover room-scoped delivery isolation for teacher, student, and pairing audiences.
- [ ] Tests cover missed snapshot or chat recovery after reconnect.
- [ ] Test names use repo domain language such as **Realtime Server**, **Realtime Connection**, **Session ID**, **Classroom Activity**, and **Pairing**.

## Blocked by

- 004-recover-authoritative-state-after-reconnect
