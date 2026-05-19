# Resume and Protect Teacher Activity Routes

Source: https://github.com/mssiegel/frempower/issues/4

These are local issue drafts produced from parent issue #4. They are not published to GitHub yet.

## Parent

Parent issue: #4

## What to build

Implement teacher resume and route protection for `/teacher` and `/teacher/:activityId`. A teacher with a valid stored **Session ID** should resume their live **Classroom Activity** and land on the hosted **Teacher Page**. Opening `/teacher/:activityId` with only the **Activity ID** or **Join Code** must never grant teacher control.

## Acceptance criteria

- [ ] `/teacher` redirects to `/teacher/:activityId` when the current teacher **Session ID** already hosts a live **Classroom Activity**.
- [ ] `/teacher/:activityId` attempts an explicit teacher resume command after the **Realtime Connection** is available.
- [ ] A valid teacher **Session ID** resumes the matching live **Classroom Activity**.
- [ ] If the server no longer recognizes the teacher **Session ID**, the **Teacher Page** returns to the host flow.
- [ ] Opening `/teacher/:activityId` without the matching teacher **Session ID** does not grant control.
- [ ] The **Activity ID** or **Join Code** alone never authorizes teacher control.
- [ ] A newer Realtime Connection for the same teacher **Session ID** replaces the older connection.
- [ ] Tests cover valid resume, stale Session ID fallback, unauthorized route access, and one-live-connection replacement behavior.

## Blocked by

- Draft Issue 2
- Draft Issue 3
