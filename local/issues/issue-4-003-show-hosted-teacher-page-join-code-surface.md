# Show the Hosted Teacher Page Join Code Surface

Source: https://github.com/mssiegel/frempower/issues/4

These are local issue drafts produced from parent issue #4. They are not published to GitHub yet.

## Parent

Parent issue: #4

## What to build

Implement the first hosted **Teacher Page** shell at `/teacher/:activityId` after hosting succeeds. This slice should establish the teacher-facing Join Code sharing surface without implementing student joining, pairing, or chat. The page should make the five-digit **Join Code** prominent and provide a copyable student join link to `/student/:activityId/register`.

## Acceptance criteria

- [ ] `/teacher/:activityId` renders a hosted **Teacher Page** shell for the teacher who just hosted the **Classroom Activity**.
- [ ] The hosted **Teacher Page** prominently shows the five-digit **Join Code**.
- [ ] The hosted **Teacher Page** provides a copyable student join link to `/student/:activityId/register`.
- [ ] The hosted **Teacher Page** does not show a QR code.
- [ ] The hosted **Teacher Page** is private teacher operations UI and does not look like a public classroom display.
- [ ] The shell leaves student joining, pairing, and chat behavior out of scope for this slice.
- [ ] Tests cover successful navigation from host acknowledgement to the hosted **Teacher Page** shell and rendering of the **Join Code** and copyable link.

## Blocked by

- Draft Issue 2
