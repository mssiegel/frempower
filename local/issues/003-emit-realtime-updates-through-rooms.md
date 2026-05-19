# Emit Realtime Updates Through Rooms

Type: AFK

## What to build

Update the current Realtime Server event boundary so audience-specific updates are emitted through Socket.IO rooms rather than broad broadcasts with application-side filtering.

This slice should establish the delivery pattern even while the full activity commands are still skeletal. Teacher-facing updates should target a teacher activity room, student-facing updates should target the current socket in each **Session ID** room, and pairing-scoped realtime events should target active **Pairing** rooms.

## Acceptance criteria

- [x] The Realtime Server exposes or uses helpers for emitting to the teacher activity room.
- [x] The Realtime Server exposes or uses helpers for emitting to the current socket in a student **Session ID** room.
- [x] The Realtime Server exposes or uses helpers for emitting to an active **Pairing** room.
- [x] Room delivery assumes only one live socket per **Session ID**.
- [x] No new realtime path uses global broadcast plus application-side filtering for teacher, student, or pairing audiences.
- [x] Tests prove that a message targeted to one room is not delivered to sockets outside that room.

## Blocked by

- 002-add-session-room-routing-foundation
