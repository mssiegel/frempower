# Build the `/teacher` Host Form Setup Flow

Source: https://github.com/mssiegel/frempower/issues/4

These are local issue drafts produced from parent issue #4. They are not published to GitHub yet.

## Parent

Parent issue: #4

## What to build

Implement the `/teacher` host form setup flow as the compact single-column sequence chosen from the prototype: create the **Characters**, choose quiet optional settings, then use **Host activity**. This slice should stop at the local form boundary: it renders the correct page, validates the host form locally, and keeps **Host activity** disabled until the form is ready. It does not need to create a **Classroom Activity** yet.

## Acceptance criteria

- [ ] `/teacher` shows a desktop-only host form and a clear unsupported-width state on small screens.
- [ ] The host form uses a compact single-column setup sequence: **Characters**, optional settings, then **Host activity**.
- [ ] The setup sequence may use numbered steps for visual rhythm, but does not behave like a wizard.
- [ ] **Characters** starts with `Character 1`, `Character 2`, and `Character 3`.
- [ ] Teacher can add and remove **Character Name** fields.
- [ ] Character rows use text inputs and remove icon buttons with accessible labels.
- [ ] **Host activity** is blocked until at least one default **Character Name** changed or one default **Character Name** row was removed.
- [ ] **Host activity** is blocked until at least two distinct non-empty **Character Names** exist.
- [ ] Duplicate **Character Name** validation trims whitespace and compares case-insensitively while preserving display casing.
- [ ] Readiness status stays local to the **Characters** validation message and the **Host activity** blocker or ready copy.
- [ ] When the form becomes valid, **Host activity** is enabled with calm ready copy such as "Ready to create a Join Code."
- [ ] The host form includes visible but quiet optional **Teacher Email**.
- [ ] The host form includes **Peer Real Name Visibility**, default off, labeled with teacher-facing action copy such as "Show students their partner's real name".
- [ ] No teacher name field, student-experience preview, reset-to-defaults action, or pre-host draft persistence exists in V1.
- [ ] Client tests cover the host validation rules and disabled/enabled **Host activity** behavior.

## Blocked by

- Parent blocker #3
