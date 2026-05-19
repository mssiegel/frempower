# Teacher Host Form Setup Flow PRD

Goal: Implement the V1 `/teacher` host form setup flow so a teacher can prepare the **Character List**, choose quiet optional settings, and see when **Host activity** is ready. This PRD is scoped to the local form boundary for `local/issues/issue-4-001-build-teacher-host-form-setup-flow.md`; creating a **Classroom Activity** comes later.

## Source Issue

- `local/issues/issue-4-001-build-teacher-host-form-setup-flow.md`
- GitHub parent: https://github.com/mssiegel/frempower/issues/4

## Product Scope

- `/teacher` shows the teacher host form on desktop widths.
- Small screens show a clear unsupported-width state.
- The form is a compact single-column sequence: **Characters**, optional settings, then **Host activity**.
- The sequence may use numbered steps for rhythm, but it is not a wizard.
- **Characters** starts with `Character 1`, `Character 2`, and `Character 3`.
- Teachers can add and remove **Character Name** rows.
- **Host activity** remains disabled until the default **Character List** has been updated and at least two distinct non-empty **Character Names** exist.
- Duplicate **Character Name** validation trims whitespace and compares case-insensitively while preserving display casing.
- Readiness status stays local to the **Characters** validation message and **Host activity** blocker or ready copy.
- Optional **Teacher Email** is visible but quiet.
- **Peer Real Name Visibility** defaults off and uses teacher-facing action copy such as "Show students their partner's real name".

## Out Of Scope

- Creating a **Classroom Activity**.
- Generating or displaying a **Join Code**.
- Hosting over the **Realtime Connection**.
- Hosted teacher activity routes.
- Student join, lobby, pairing, chat, settings, or **End Activity** flows.
- Teacher name fields.
- Student-experience previews.
- Reset-to-defaults actions.
- Pre-host draft persistence.
- Authentication, database, Docker, Docker Compose, dev containers, or container-specific scripts.

## Local Issue Backlog

- [ ] `local/issues/issue-4-001-build-teacher-host-form-setup-flow.md`
- [ ] `local/issues/issue-4-002-create-classroom-activity-from-teacher-host-command.md`
- [ ] `local/issues/issue-4-003-show-hosted-teacher-page-join-code-surface.md`
- [ ] `local/issues/issue-4-004-resume-and-protect-teacher-activity-routes.md`
- [ ] `local/issues/issue-4-005-route-teacher-realtime-delivery-through-session-and-activity-rooms.md`
- [ ] `local/issues/issue-4-006-connect-homepage-teacher-and-student-ctas.md`

Current Ralph status: start `local/issues/issue-4-001-build-teacher-host-form-setup-flow.md`.

## Ralph Workflow

1. Run `./afk-ralph.sh`.
2. The script targets `local/issues/issue-4-001-build-teacher-host-form-setup-flow.md` by default.
3. Ralph implements exactly one unchecked acceptance criterion from that local issue.
4. Ralph marks that criterion complete in the local issue only after relevant verification passes, or records the blocker in `progress.txt`.
5. When the local issue has no remaining unchecked acceptance criteria, Ralph marks the matching backlog item complete in this PRD.
6. Ralph updates `progress.txt` every iteration.
7. Ralph commits each successful iteration on the current named branch; do not push, merge, close GitHub issues, or modify GitHub issues.

## Verification

- Prefer focused client tests for host form validation and disabled/enabled **Host activity** behavior.
- Run the smallest relevant command for the selected criterion, such as `npm run test -w client`, before checking off a criterion.
- Run formatting on touched client, Markdown, and script files when practical.
- Do not declare the local issue complete in this PRD until all acceptance criteria in the local issue are checked.
