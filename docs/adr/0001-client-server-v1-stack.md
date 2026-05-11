# Client and Server V1 Stack

Frempower V1 is a plain SPA with a search-indexable homepage, open teacher and student experiences, real-time chat, and no durable database. We will build the client with Vite, React, TypeScript, and Material UI; build the server with Node.js and Express; use Socket.IO for real-time participant, pairing, disconnect, and chat events; and keep V1 classroom activity state in server memory.

## Considered Options

- Next.js or another SSR framework: rejected because only the homepage has an SEO requirement, and the rest of the client is an app-first SPA.
- Plain WebSockets: rejected because Socket.IO provides reconnect behavior, rooms/events, and disconnect handling that match the V1 workflow.
- Durable database storage: rejected for V1 so participant, pairing, and chat state stay lightweight and tied to the current server process.

## Consequences

The homepage must be designed so it can be optimized for SEO inside the Vite SPA. Classroom activity state, completed chats, and transcripts do not survive a server restart until a later persistence decision replaces the V1 in-memory model.
