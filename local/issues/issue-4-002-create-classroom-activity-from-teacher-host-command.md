# Create Classroom Activity From the Teacher Host Command

Source: https://github.com/mssiegel/frempower/issues/4

These are local issue drafts produced from parent issue #4. They are not published to GitHub yet.

## Parent

Parent issue: #4

## What to build

Wire the ready `/teacher` form to the **Realtime Server** so **Host activity** creates a live **Classroom Activity** through a Socket.IO command acknowledgement. The server should generate and reserve a five-digit **Join Code**, create or return a random opaque teacher **Session ID**, store the hosted activity in memory, and return the data the **Client** needs to navigate to `/teacher/:activityId`.

## Acceptance criteria

- [ ] **Host activity** sends a Socket.IO command acknowledgement rather than a REST request.
- [ ] The host payload includes **Character Names**, optional **Teacher Email**, and **Peer Real Name Visibility**.
- [ ] Server validation remains authoritative for the submitted **Character List**.
- [ ] Server stores trimmed **Character Names** while preserving display casing.
- [ ] Server rejects fewer than two distinct non-empty **Character Names**.
- [ ] Server duplicate validation trims whitespace and compares case-insensitively.
- [ ] Server creates a live **Classroom Activity** with **Peer Real Name Visibility** defaulting off when not supplied.
- [ ] Server generates **Join Codes** in the range `10000` through `99999`.
- [ ] Server retries **Join Code** collisions and reserves the **Join Code** while the activity is live.
- [ ] Server returns an **Activity ID** equal to the **Join Code** in V1.
- [ ] Server returns/stores a random opaque teacher **Session ID** that is not derived from the **Join Code** or socket ID.
- [ ] Client stores the teacher **Session ID** in `sessionStorage`.
- [ ] Client navigates to `/teacher/:activityId` after a successful host acknowledgement.
- [ ] Tests cover host validation, acknowledgement success/error shapes, **Join Code** generation/collision retry, and teacher **Session ID** creation.

## Blocked by

- Draft Issue 1
- Parent blocker #3
