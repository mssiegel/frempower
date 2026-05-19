# Context Map

This repo uses separate context docs for the client and server.

## Contexts

- **Client**: `client/CONTEXT.md`
  - Read for frontend, product, UI, routing, state management, styling, and browser-facing behavior.
  - ADRs live in `client/docs/adr/`.
- **Server**: `server/CONTEXT.md`
  - Read for backend, API, data, auth, integrations, jobs, and operational behavior.
  - ADRs live in `server/docs/adr/`.

For changes that cross the client/server boundary, read both context files before proposing or implementing changes.

## V1 terminology clarifications

- **In-Memory Login** is an internal domain term only. User-facing copy should use actions such as "Host activity", "Join activity", or "Resume activity"; avoid "login", "sign in", and "sign up".
- **Student Real Name** is the domain term for the name a student enters so the teacher can identify them. Student-facing copy labels this field "Your name"; avoid "display name".
- **Character Name** is the roleplaying name assigned for a specific pairing. Do not use "student name" when the distinction matters.
- **Join Code** is the user-facing label for the five-digit code for a live **Classroom Activity**. Avoid "PIN", "room code", "game code", and account-access language.
- **Activity ID** is the route form of the five-digit **Join Code** in version 1. It is an implementation and route term, not a separate durable identifier or user-facing label.
- **Session ID** identifies a participant session during the current server process. Socket.IO socket IDs are transport-level debug information and are never participant identity.
- **Teacher** and **Student** are current-activity participant modes, not access-controlled roles or durable accounts.
- Avoid user-facing "saved" language for version 1 activity state. Prefer "updated", "applied", or "retained in server memory for the current process", depending on context.
