# Add Session Room Routing Foundation

Type: AFK

## What to build

Add the server-side routing foundation needed for current and upcoming Realtime Server commands to scope delivery by **Session ID** instead of socket ID or global broadcast filtering.

This slice should introduce a small connection registry and room naming helpers. It does not need to implement full host, join, pairing, or chat behavior. It should make the Socket.IO layer ready to track the current socket for one **Session ID**, enforce only one live socket per **Session ID**, and join that socket to stable rooms after successful host, join, or resume commands.

## Acceptance criteria

- [x] The Realtime Server has a connection registry that tracks `Session ID -> current socket ID`.
- [x] The registry enforces only one live socket connection per **Session ID**.
- [x] If a new socket resumes the same **Session ID**, the registry replaces the old socket with the new current socket.
- [x] A participant is considered connected while the current socket remains registered for the **Session ID**.
- [x] The registry removes the current socket on disconnect and reports when the **Session ID** has no current socket.
- [x] Server-private room naming helpers exist for **Session ID** rooms, teacher activity rooms, and active **Pairing** rooms.
- [x] Tests cover single-live-socket replacement, current-socket disconnect, and room name stability.

## Blocked by

- 001-configure-realtime-heartbeat-baseline
