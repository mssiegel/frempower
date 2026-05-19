# Current Codebase Socket.IO Implementation Plan

## Goal

Bring the current Realtime Server and Client in line with the V1 realtime contract:

- Detect dead connections through Socket.IO heartbeat/ping-pong.
- Scope delivery with Socket.IO rooms instead of global broadcasts and application-side filtering.
- Preserve authoritative activity/chat state through reconnect windows so transient socket loss does not silently drop important updates.

## Current State

- `server/src/index.ts` creates a Socket.IO server with default options and only logs connect/disconnect.
- `client/src/realtime.ts` creates a basic Socket.IO client and exposes connection status.
- Shared realtime event names, acknowledgement result types, snapshots, timeout constants, and payload types already live in `@frempower/shared`.
- The activity service is Socket.IO-free, but it is still a skeleton and does not yet own participants, pairings, messages, or reconnect timers.

## Implementation Plan

1. Configure explicit Socket.IO heartbeat settings in the server bootstrap.
   - Choose `pingInterval` and `pingTimeout` values shorter than the domain reconnect grace periods.
   - Treat Socket.IO `disconnect` as the transport signal that may start a domain reconnect timer after the last socket for a **Session ID** disconnects.

2. Add a Realtime Connection registry in the Socket.IO layer.
   - Track `Session ID -> Set<socket.id>`.
   - Join sockets to a stable Session ID room after successful host, join, or resume.
   - Mark a participant disconnected only when the Session ID socket set becomes empty.
   - Rejoin rooms and cancel pending disconnect timers on resume.

3. Define room naming helpers in the server Socket.IO layer.
   - Session room: one per **Session ID**.
   - Teacher activity room: one per **Classroom Activity** teacher audience.
   - Pairing room: one per active **Pairing**.
   - Keep room names server-private; do not expose them as domain identifiers.

4. Emit snapshots and realtime events only to rooms.
   - Teacher snapshots go to the teacher activity room.
   - Student snapshots go to individual Session ID rooms.
   - Chat messages and typing indicators go to the active Pairing room.
   - Do not broadcast globally and filter by activity, student, or pairing in handlers or the Client.

5. Make activity state the recovery source.
   - Store chat messages in in-memory pairing state before emitting them.
   - Store removed, ended, pairing-ended, and visibility state in the activity service before emitting snapshots.
   - On resume, send a fresh audience-specific snapshot for that Session ID.
   - Keep typing indicators ephemeral; they may expire during disconnects.

6. Add short-lived pending delivery only where snapshots are not enough.
   - Prefer recovery snapshots for authoritative state.
   - If a command needs a targeted follow-up while no socket is connected, queue it by **Session ID** with a bounded lifetime no longer than the relevant reconnect timeout.
   - Flush pending delivery after successful resume, then clear it.

7. Test the boundary behavior.
   - Unit-test room naming and connection registry behavior.
   - Socket.IO integration-test last-socket disconnect, multi-tab Session IDs, resume room rejoin, and heartbeat-driven disconnect handling.
   - Activity-service tests should use fake timers or injectable timers for reconnect timeouts.
   - Chat tests should prove pairing isolation and missed-message recovery after reconnect.
