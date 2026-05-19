# Configure Realtime Heartbeat Baseline

Type: AFK

## What to build

Configure the current Realtime Server and Client so dead connections are detected through Socket.IO heartbeat/ping-pong behavior instead of relying on TCP keepalive or default, undocumented transport timing.

This slice should make heartbeat behavior explicit and observable without implementing the full Classroom Activity lifecycle yet. The server should define heartbeat settings, and the Client should continue to expose accurate connection state when Socket.IO connects, disconnects, and reconnects.

## Acceptance criteria

- [x] The Realtime Server configures explicit Socket.IO `pingInterval` and `pingTimeout` values.
- [x] The chosen heartbeat values are shorter than the existing domain reconnect grace periods.
- [x] Server disconnect logging or instrumentation clearly treats Socket.IO disconnect as the transport-level signal for future **Teacher Disconnect** and **Student Disconnect** behavior.
- [x] The Client connection hook reflects connected and disconnected states from Socket.IO events.
- [x] Tests or a small verification path cover connection and disconnect state changes.

## Blocked by

None - can start immediately
