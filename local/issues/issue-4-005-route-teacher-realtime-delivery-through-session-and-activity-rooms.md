# Route Teacher Realtime Delivery Through Session and Activity Rooms

Source: https://github.com/mssiegel/frempower/issues/4

These are local issue drafts produced from parent issue #4. They are not published to GitHub yet.

## Parent

Parent issue: #4

## What to build

Apply the realtime hosting routing decisions from the parent issue comments. On teacher host and resume, join the teacher socket to a **Session ID** room and an activity-scoped teacher room. Use this routing context for teacher snapshots and future hosted teacher updates instead of relying on socket IDs or broad broadcasts.

## Acceptance criteria

- [ ] On teacher host, the socket joins a **Session ID** room.
- [ ] On teacher host, the socket joins an activity-scoped teacher room.
- [ ] On teacher resume, the socket rejoins the same routing rooms.
- [ ] Host and resume acknowledgements establish the routing context needed for room-scoped teacher snapshots.
- [ ] Teacher snapshot delivery can target the activity-scoped teacher room.
- [ ] Socket IDs are not used as participant identity.
- [ ] Teacher disconnect timing begins from Socket.IO disconnect after the last socket for the **Session ID** leaves.
- [ ] Heartbeat behavior relies on Socket.IO ping/pong settings, not TCP keepalive signals.
- [ ] Tests cover room naming, host/resume room membership, teacher snapshot delivery scope, and last-socket disconnect behavior.

## Blocked by

- Draft Issue 2
- Draft Issue 4
