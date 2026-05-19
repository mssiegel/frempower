# Recover Authoritative State After Reconnect

Type: AFK

## What to build

Add the reconnect recovery pattern for current realtime state: when a **Session ID** reconnects, the server sends a fresh audience-specific snapshot from authoritative in-memory state instead of depending on transient socket emits that may have been missed while disconnected.

Version 1 allows only one live connection per **Session ID**. If a new socket resumes a **Session ID** while an older socket is still connected, the new socket replaces the old socket and receives the recovery snapshot.

This slice should keep the activity service Socket.IO-free. Authoritative activity and chat state should live in the activity service, while the Socket.IO layer handles routing and snapshot delivery.

## Acceptance criteria

- [x] Resume handling sends a fresh teacher or student snapshot for the reconnecting **Session ID** when authoritative state exists.
- [x] Resume handling treats the newest socket for a **Session ID** as current and disconnects any older socket for that **Session ID**.
- [x] Missed removed, activity-ended, pairing-ended, and chat state are represented as snapshot state rather than transient-only notifications.
- [x] Chat messages are stored in in-memory pairing state before realtime delivery.
- [x] Typing indicators remain ephemeral and are allowed to expire during disconnects.
- [x] The Socket.IO layer does not make socket IDs participant identity.
- [x] Tests cover reconnecting after a missed state change and receiving the current snapshot on the newest socket.

## Blocked by

- 003-emit-realtime-updates-through-rooms
