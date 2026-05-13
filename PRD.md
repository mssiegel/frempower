# Issue #3: Shared Realtime Contracts And Activity Foundation

Goal: Create the shared realtime contracts and in-memory activity foundation for Frempower V1.

## Parent

Parent PRD: GitHub issue #1.

## Known decisions

- Use a root npm workspace.
- Client lives in `client/`.
- Server lives in `server/`.
- Shared realtime contracts live in a workspace package named `@frempower/shared`.
- Server validation remains authoritative.
- Use plain runtime validation functions rather than adding a schema validation library.
- State changes are sent through full audience-specific activity snapshots.
- Realtime commands use Socket.IO acknowledgements with a standard success/error discriminated union.
- Command acknowledgement errors include stable machine-readable error codes separate from user-facing copy.
- Server activity rules live in an in-memory activity service or store separate from Socket.IO handlers.
- Activity service tests should be deterministic through centralized or injectable clock, random, and Join Code dependencies.
- Keep Ralph human-in-the-loop. `ralph-once.sh` runs one watched iteration and leaves diffs for software engineering author review.

## Scope

Create the foundation for shared contracts and server activity logic. This slice should introduce `@frempower/shared`, define the core realtime contract types/constants/helpers, add Vitest, create a server activity service skeleton that can be tested independently from Socket.IO, and preserve the realtime/session ADR.

This slice should not implement the full host, join, pairing, or chat UI flows yet.

## Tasks

- [x] Add a workspace package named `@frempower/shared`.
- [x] Shared package exports product constants including Join Code length/range, default Character Names, chat message length, and disconnect timeout durations.
- [x] Shared package exports a standard command acknowledgement result type with success/error discriminated union.
- [x] Command acknowledgement errors support stable machine-readable error codes separate from user-facing copy.
- [x] Shared package exports initial teacher/student snapshot and realtime payload types.
- [x] Shared package exports pure normalization helpers for Character Names and Student Real Names.
- [ ] Add Vitest for shared and server tests.
- [ ] Create an in-memory activity service/store skeleton separate from Socket.IO handlers.
- [ ] Activity service accepts or centralizes clock/random/join-code dependencies so tests can be deterministic.
- [ ] Activity service does not import or directly use Socket.IO.
- [ ] Add or preserve system ADR `docs/adr/0002-realtime-session-contracts.md`.
- [ ] Tests cover shared constants/helpers, acknowledgement result helpers if present, Join Code generation collision retry, and basic activity service construction.
- [ ] Confirm with software engineering author that its okay for Ralph to automatically push this branc to github merge it into git Main and then close the related Github issue.

## Constraints

- Do not implement the full host, join, pairing, or chat UI flows yet.
- Do not add authentication.
- Do not add a database.
- Do not add Docker, Docker Compose, dev containers, or container-specific scripts.
- Keep Socket.IO handlers thin and outside the activity service.
- Do not use socket IDs as participant identity.
- Prefer small, reviewable commits.
- Run the most relevant feedback loop before marking a task complete.
- Leave Ralph iteration diffs uncommitted for software engineering author review.

## Verification

- Run focused tests or type checks for the task Ralph completes.
- Before a Ralph task is marked complete, update this file and `progress.txt`.
- Do not declare the issue complete until all checkboxes are checked and the software engineering author has approved any automated push, merge, and GitHub issue closure behavior.
