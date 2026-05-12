# Issue #2: Scaffold V1 App Shell

Goal: Create the runnable Frempower V1 baseline across the Client and Server.

## Known decisions

- Use a root npm workspace.
- Client lives in `client/`.
- Server lives in `server/`.
- Client: Vite, React, TypeScript, Material UI, React Router, Socket.IO client, React Compiler, Inter typography.
- Server: Node.js, Express, TypeScript, Socket.IO.
- State: no database for V1.
- No Docker for issue #2.
- Routes:
  - `/` Homepage
  - `/teacher` Teacher Page
  - `/student` Student Page
- Homepage is the only search-indexable Client page.
- Teacher Page and Student Page are open app experiences, not authenticated dashboards.
- Follow ADR-0001 and the context docs.

## Palette

Primary:
- `#070AC5`
- `#5B5DF9`
- `#9D9EFB`
- `#C4C5FD`
- `#EBECFE`
- `#F8F8FF`

Secondary:
- `#95C021`
- `#BFE35B`
- `#DDF0A8`
- `#F8FCEE`

Neutrals:
- `#2B313B`
- `#4D586A`
- `#718098`
- `#A0AABA`
- `#D0D5DD`
- `#F3F4F6`
- `#FFFFFF`

Text:
- primary `#2B313B`
- secondary `#718098`

## Tasks

- [x] Create a root npm workspace with `client` and `server` packages.
- [x] Scaffold the Client as a Vite React TypeScript app.
- [x] Add Material UI, React Router, Socket.IO client, Inter font, and React Compiler config.
- [x] Add the Material UI theme using the approved palette.
- [x] Add routes for `/`, `/teacher`, and `/student`.
- [ ] Add visible placeholder pages for Homepage, Teacher Page, and Student Page.
- [ ] Give the Homepage SEO-oriented metadata and semantic content structure.
- [ ] Scaffold the Server with Node.js, Express, TypeScript, and Socket.IO.
- [ ] Add a health check endpoint.
- [ ] Add basic Socket.IO connection wiring. only teachers page and students page need socket connections (not the homepage)
- [ ] Configure Client local access to the Server and Socket.IO endpoint.
- [ ] Add root build, lint, test, and dev commands.
- [ ] Make build, lint, and test pass.

## Constraints

- Do not implement the full Classroom Activity workflow yet.
- Do not add authentication.
- Do not add a database.
- Do not add Docker, Docker Compose, dev containers, or container-specific scripts.
- Keep this baseline simple and boring.
- Prefer known-working defaults over clever architecture.
- Use local npm workspace scripts for development, build, lint, and test.
- Use project terminology from `client/CONTEXT.md` and `server/CONTEXT.md`.
