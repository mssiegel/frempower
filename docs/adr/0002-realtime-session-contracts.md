# Realtime Session Contracts

Frempower V1 uses Socket.IO as the primary transport for live classroom activity behavior. Hosting, joining, resuming, pairing, chatting, disconnect handling, and activity snapshots use realtime events rather than REST endpoints.

## Considered Options

- REST commands with Socket.IO updates: rejected because activity creation, joining, and resuming immediately depend on realtime session state and snapshots.
- Socket.IO socket IDs as participant identity: rejected because socket IDs are ephemeral and change across reconnects.
- Patch events for each state change: rejected for V1 because full snapshots make reconnects, refreshes, and client state management simpler.
- Duplicated client/server event types: rejected because the event contract is large enough that drift would be likely.

## Decision

We will use random opaque **Session IDs** stored in `sessionStorage` to identify teacher and student sessions during the current server process. The Client sends the Session ID through Socket.IO auth when connecting, then routes issue explicit resume commands so the server can validate the route intent and activity state.

Command-style realtime events will use Socket.IO acknowledgements with a standard discriminated union result shape. State changes will broadcast full audience-specific snapshots using event names such as `teacher:activitySnapshot` and `student:activitySnapshot`.

Realtime event payloads, acknowledgement result types, snapshot types, shared constants, and small pure helpers will live in `@frempower/shared`.

Server classroom activity rules will live in an in-memory activity store or service separate from Socket.IO handlers. The service owns state, timers, injected clock/random helpers, and state-change callbacks. The Socket.IO layer owns socket connections, routing, and snapshot broadcasting.

## Consequences

The Realtime Server remains the authoritative source for activity state and timeout transitions. The Client renders countdowns from server-provided deadline timestamps, but waits for server snapshots before changing authoritative state.

This keeps V1 simple and testable, but means REST API routes are intentionally minimal. If Frempower later adds durable persistence, account authentication, or non-realtime integrations, the activity/session contract may need a new ADR.
