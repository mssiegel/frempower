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
