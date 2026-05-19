# Realtime Session Contracts

Frempower V1 uses Socket.IO as the primary transport for live classroom activity behavior. Hosting, joining, resuming, pairing, chatting, disconnect handling, and activity snapshots use realtime events rather than REST endpoints.

## Considered Options

- REST commands with Socket.IO updates: rejected because activity creation, joining, and resuming immediately depend on realtime session state and snapshots.
- Socket.IO socket IDs as participant identity: rejected because socket IDs are ephemeral and change across reconnects.
- Multiple live sockets for one **Session ID**: rejected because V1 uses guest sessions without durable accounts or database-backed multi-device login.
- Patch events for each state change: rejected for V1 because full snapshots make reconnects, refreshes, and client state management simpler.
- Duplicated client/server event types: rejected because the event contract is large enough that drift would be likely.
- TCP keepalive as the only dead-connection signal: rejected because classroom reconnect behavior needs application-level heartbeat timing that Socket.IO can surface consistently to the Realtime Server.
- Global broadcasts with application-side filtering: rejected because teacher snapshots, student snapshots, chat messages, and typing events have clear audiences that should be enforced by Socket.IO rooms.
- Transient-only message delivery during reconnect windows: rejected because brief classroom network loss should not silently drop authoritative chat or activity state.

## Decision

We will use random opaque **Session IDs** stored in `sessionStorage` to identify teacher and student sessions during the current server process. The Client sends the Session ID through Socket.IO auth when connecting, then routes issue explicit resume commands so the server can validate the route intent and activity state.

Each **Session ID** represents one guest session in one browser tab. Version 1 allows only one live socket connection per **Session ID**. If a new socket resumes the same **Session ID** while an older socket is still connected, the Realtime Server treats the newer socket as authoritative, disconnects the older socket, and keeps participant identity tied to the **Session ID** rather than either socket ID.

Command-style realtime events will use Socket.IO acknowledgements with a standard discriminated union result shape. State changes will broadcast full audience-specific snapshots using event names such as `teacher:activitySnapshot` and `student:activitySnapshot`.

Realtime event payloads, acknowledgement result types, snapshot types, shared constants, and small pure helpers will live in `@frempower/shared`.

Server classroom activity rules will live in an in-memory activity store or service separate from Socket.IO handlers. The service owns state, timers, injected clock/random helpers, and state-change callbacks. The Socket.IO layer owns socket connections, routing, and snapshot broadcasting.

The Realtime Server will configure explicit Socket.IO heartbeat settings (`pingInterval` and `pingTimeout`) and will treat Socket.IO disconnects as the input to domain reconnect timers. TCP keepalive is not the authority for **Teacher Disconnect** or **Student Disconnect** behavior.

The Socket.IO layer will use rooms for delivery scoping. The current socket joins a room for its **Session ID** after successful host, join, or resume. Teacher-facing activity updates emit to an activity-scoped teacher room. Student snapshots emit to the receiving student's **Session ID** room. Chat messages and typing indicators emit to the active **Pairing** room. Handlers should not broadcast globally and rely on application-side filtering to protect audiences.

During reconnect windows, authoritative state remains in the activity service and must be recoverable through snapshots when the **Session ID** reconnects. Chat messages are recorded in in-memory pairing state before any socket emit. The Socket.IO layer may also keep short-lived pending session-targeted emits, but recovery snapshots are the source of truth for missed activity-ended, removed, pairing-ended, and chat state.

## Consequences

The Realtime Server remains the authoritative source for activity state and timeout transitions. The Client renders countdowns from server-provided deadline timestamps, but waits for server snapshots before changing authoritative state.

Room membership becomes part of the realtime contract, so Socket.IO handler tests should verify that events are scoped to teacher, student, and pairing audiences. Reconnect tests should verify single-live-socket replacement, room rejoin, and recovery of missed snapshot/chat state.

This keeps V1 simple and testable, but means REST API routes are intentionally minimal. If Frempower later adds durable persistence, account authentication, or non-realtime integrations, the activity/session contract may need a new ADR.
