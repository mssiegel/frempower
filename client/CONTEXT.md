# Client Context

This context captures frontend, product, UI, routing, state management, styling, and browser-facing domain language for Frempower.

## Language

**Client**:
The browser-facing Frempower application.
_Avoid_: Frontend app, web app

**Homepage**:
The public entry page that should be discoverable by search engines.
_Avoid_: Landing page, marketing page

**App Shell**:
The authenticated or task-oriented single-page application experience after the public entry point.
_Avoid_: Portal, dashboard shell

**Teacher Page**:
The open client experience where a teacher can identify themselves and pair students for chats.
_Avoid_: Teacher dashboard, teacher portal

**Student Page**:
The open client experience where a student can identify themselves and participate in assigned chats.
_Avoid_: Student dashboard, student portal

**Student List**:
The teacher-facing live list of lobby students who can be considered for pairing.
_Avoid_: Roster, class list

**Student Real Name**:
The name a student enters so the teacher can identify them during the current classroom activity.
_Avoid_: Username, account name, display name

**Character Name**:
The roleplaying name a student receives for a specific pairing.
_Avoid_: Avatar, persona, nickname

**Character List**:
The teacher-provided set of character names available for automatic assignment to students.
_Avoid_: Cast list, roster, role list

**Characters**:
The teacher-facing section heading for editing the **Character List**.
_Avoid_: Roles

**Join Code**:
The five-digit number students enter to join a teacher's live classroom activity.
_Avoid_: Room code, game code, class code, PIN

**Activity ID**:
The five-digit identifier in the route for a live classroom activity; in version 1 it is the same value as the **Join Code**.
_Avoid_: Database ID, slug, UUID

**Entity ID**:
An opaque in-memory identifier for activity entities such as students, pairings, and completed chats.
_Avoid_: Student name, character name, database ID

**Session ID**:
The private sessionStorage identifier used to reconnect a participant to the same in-memory activity session.
_Avoid_: Socket ID, account ID, user ID

**Peer Real Name Visibility**:
The teacher-controlled setting that determines whether students can see the real name of the student they are chatting with.
_Avoid_: Privacy mode, anonymity, reveal names

**Completed Chats**:
The teacher-facing section that lists chat transcripts from pairings that have ended during the current server process.
_Avoid_: Chat history, archive

**Pairing History**:
The in-memory record of student pairings created during a classroom activity, including pairings that ended without messages.
_Avoid_: Completed chats, chat history

**End Activity**:
The teacher action that finishes the current classroom activity and requests a transcript email.
_Avoid_: Finish class, close room

**Teacher Disconnect**:
A best-effort signal that the teacher may have left by closing the browser or losing connection.
_Avoid_: Logout, hard close

**Teacher Disconnect Timeout**:
The two-minute grace period after the teacher disconnects before the server ends the classroom activity.
_Avoid_: Session timeout, logout timeout

**Student Disconnect**:
A best-effort signal that a student may have left by closing the browser or losing connection.
_Avoid_: Logout, hard close

**Lobby Student Disconnect Timeout**:
The 15-second grace period after a lobby student disconnects before the student is removed from the classroom activity.
_Avoid_: Session timeout, logout timeout

**Disconnected Pairing Timeout**:
The 30-second grace period for a pairing created with a disconnected lobby student before the server ends that student's active pairing.
_Avoid_: Middle grace period, paired-lobby timeout

**Chat Reconnect Timeout**:
The 90-second grace period after a student disconnects during an active chat before the server ends that student's active pairing.
_Avoid_: Session timeout, logout timeout

**Realtime Connection**:
The Socket.IO connection used by the client to receive live activity, pairing, and chat updates.
_Avoid_: WebSocket, polling stream

## Relationships

- The **Client** is primarily a plain SPA.
- The **Homepage** is the only part of the **Client** with an explicit SEO requirement.
- The **Homepage** lives inside the same Vite application as the **App Shell**.
- The **App Shell** can prioritize interaction speed and application ergonomics over search indexing.
- The **Homepage** is served at `/`.
- The **Homepage** primary call to action is "Join activity".
- The **Homepage** secondary teacher call to action is "Host activity".
- The **Teacher Page** entry flow is served at `/teacher`.
- The `/teacher` route shows the host form.
- If the teacher has a live **Classroom Activity** in the current **Session ID**, `/teacher` redirects to `/teacher/:activityId`.
- A hosted **Teacher Page** is served at `/teacher/:activityId`.
- The hosted **Teacher Page** prominently shows the **Join Code** for teacher reference and sharing.
- The hosted **Teacher Page** provides a copyable student join link to `/student/:activityId/register`.
- The hosted **Teacher Page** does not show a QR code for joining because the teacher screen is not intended for student display.
- The hosted **Teacher Page** is a private teacher operations view and should not assume the teacher is screen sharing it with students.
- The hosted **Teacher Page** must avoid exposing student pairing details as if it were meant for public classroom display.
- The **Student Page** entry flow is served at `/student`.
- The `/student` route is a focused **Join Code** entry screen.
- The **Join Code** input is optimized for numeric entry and advances after five digits when the code is valid.
- The student registration step is served at `/student/:activityId/register`.
- The student lobby is served at `/student/:activityId/lobby`.
- A student's active chat is served at `/student/:activityId/chat/:pairingId`.
- The **Teacher Page** and **Student Page** are open experiences anyone can visit.
- A teacher **Session ID** can host at most one live **Classroom Activity** at a time.
- Multiple teachers can each host their own live **Classroom Activity** at the same time.
- Hosting a **Classroom Activity** creates a five-digit **Join Code**.
- In version 1, the **Activity ID** is the same five-digit value as the **Join Code**.
- Client routes validate that **Activity ID** route parameters are exactly five numeric digits before sending realtime commands.
- **Join Codes** are numeric-only and displayed as five plain digits without separators.
- **Join Codes** are generated in the range `10000` through `99999` to avoid leading zeros.
- **Join Codes** are generated by the server, not chosen by the teacher.
- Students enter the **Join Code** on the **Student Page** to join the teacher's **Classroom Activity**.
- The **Student Page** asks for the **Join Code** before asking for **Student Real Name**.
- After a valid **Join Code**, the **Student Page** navigates to `/student/:activityId/register`.
- After entering **Student Real Name**, the **Student Page** navigates to `/student/:activityId/lobby`.
- The student lobby shows the student's own **Student Real Name** and a waiting state.
- The student lobby does not show the **Student List** or other joined students.
- The student lobby does not include a **Leave Activity** action in version 1.
- All students in the lobby are ready to chat in version 1.
- If a student enters a **Join Code** with no live **Classroom Activity**, the join flow shows an inline error and does not create a **Chat Participant**.
- A participant's **Session ID** identifies them across **Realtime Connection** reconnects and same-tab page refreshes during the current server process.
- A **Session ID** is stored in sessionStorage and represents one guest session in one browser tab.
- Teacher and student **Session IDs** use separate sessionStorage keys.
- The server generates **Session IDs** and returns them to the **Client** during host or join commands when needed.
- **Session IDs** are random opaque values and are not derived from **Join Codes**, socket IDs, or participant names.
- Students, pairings, and completed chats use opaque **Entity IDs** for client actions and rendering.
- A teacher who refreshes the **Teacher Page** with a valid **Session ID** rejoins their live **Classroom Activity**.
- If the server no longer recognizes the teacher **Session ID**, the **Teacher Page** returns to the host flow.
- Opening `/teacher/:activityId` without the matching teacher **Session ID** does not grant access to control the **Classroom Activity**.
- Version 1 does not support teacher takeover from the **Activity ID** or **Join Code** alone.
- A student who refreshes the joined **Student Page** with a valid **Session ID** rejoins the same **Classroom Activity**.
- If the server no longer recognizes the student **Session ID**, the **Student Page** returns to the join flow.
- Opening `/student/:activityId/register` without a valid student **Session ID** shows the student registration step with the **Join Code** supplied by the route, then asks for **Student Real Name** if the activity exists.
- `/student/:activityId/register` verifies that the **Classroom Activity** exists before showing the **Student Real Name** form.
- If `/student/:activityId/register` points to an unavailable activity, the **Student Page** shows a clear unavailable-activity state with a path back to `/student`.
- Opening `/student` shows the student join flow and asks for both **Join Code** and **Student Real Name**.
- A Socket.IO socket ID is never used as a participant identity because it is ephemeral.
- The **Teacher Page** starts from a host flow where the teacher can edit the **Character List** before hosting the **Classroom Activity**.
- The **Character List** starts with `Character 1`, `Character 2`, and `Character 3` as default **Character Names** that the teacher can change.
- The host flow labels the editable **Character List** section as **Characters**.
- Input labels, validation, and precise references use **Character Name**.
- The teacher can add and remove **Character Name** fields while editing the **Character List**.
- Hosting a **Classroom Activity** requires at least two distinct non-empty **Character Names**.
- The teacher can edit the **Character List** while the **Classroom Activity** is live.
- Edits to the **Character List** affect only future **Pairings**.
- Existing **Active Pairings** and **Completed Chats** keep the **Character Names** they already received.
- A draft **Character List** can temporarily have fewer than two distinct non-empty **Character Names** while the teacher is editing.
- The teacher cannot host or save **Character List** changes until the draft has at least two distinct non-empty **Character Names**.
- Duplicate **Character Names** are allowed while editing a draft **Character List**, but they block hosting or saving.
- **Character Name** duplicate validation trims whitespace and compares names case-insensitively.
- Applied **Character Names** preserve the teacher's chosen casing for display.
- The **Teacher Page** does not ask for a teacher name in version 1.
- The **Teacher Page** can host an activity with or without a **Teacher Email**.
- The teacher can enter or update **Teacher Email** while the **Classroom Activity** is live.
- The **Student Page** requires a **Student Real Name** so the teacher can identify each student.
- The student-facing label for **Student Real Name** is "Your name".
- Duplicate **Student Real Names** are allowed in the same **Classroom Activity**.
- The **Teacher Page** can show a visual cue when multiple live students have the same **Student Real Name**.
- The same **Student Real Name** can be entered by separate guest sessions in the same **Classroom Activity**, but a single guest session is live in only one browser tab.
- Each student receives an automatically assigned **Character Name** when the teacher creates a **Pairing** in version 1.
- **Character Names** are scoped to a **Pairing**, not to a student for the whole **Classroom Activity**.
- Two students in the same **Pairing** cannot have the same **Character Name**.
- Students in different **Pairings** can have the same **Character Name**.
- **Character Names** are assigned randomly from the **Character List** for each **Pairing**.
- The **Teacher Page** shows both each student's **Student Real Name** and assigned **Character Name**.
- The **Student List** does not show **Character Names** for unpaired lobby students.
- **Character Names** appear only in **Active Pairings** and **Completed Chats**.
- The **Teacher Page** displays **Active Pairings** with each student's **Student Real Name** and assigned **Character Name** in a compact format.
- **Active Pairings** can show compact live previews of the most recent chat messages for teacher monitoring.
- A collapsed **Active Pairing** preview renders only the preview messages, not the full chat transcript.
- The teacher cannot send messages into student chats in version 1.
- The teacher cannot delete or hide student chat messages in version 1.
- The teacher cannot pause a **Classroom Activity** in version 1.
- The teacher cannot lock a **Classroom Activity** to prevent new students from joining in version 1.
- Students cannot report messages in version 1.
- The **Student Page** shows a chat partner's **Character Name**.
- The **Student Page** shows a chat partner's **Student Real Name** only when **Peer Real Name Visibility** is enabled.
- The student chat page makes the student's own **Character Name** the primary identity.
- The student chat page can show the student's own **Student Real Name** quietly for orientation.
- The student chat page uses a real-time game chat style where messages are shown as **Character Name** followed by message text.
- The student chat page does not use a WhatsApp-style bubble layout in version 1.
- The student chat input placeholder follows the pattern "Talk as [Character Name]...".
- The chat input blocks empty or whitespace-only messages.
- Sent chat messages trim leading and trailing whitespace while preserving internal spacing.
- Chat messages are limited to 75 characters in version 1.
- The 75-character chat message limit applies after trimming leading and trailing whitespace.
- Version 1 uses JavaScript string length for the 75-character chat message limit.
- Chat messages can include native keyboard emojis.
- Version 1 chat supports text and native keyboard emojis only; images, files, links, and rich attachments are out of scope.
- URLs in chat messages render as non-clickable plain text in version 1.
- The chat input shows a subtle character counter only when the student is close to the 75-character limit.
- Students cannot edit or delete chat messages in version 1.
- The student chat page shows a typing indicator when the chat partner is typing.
- A typing indicator disappears after three seconds unless refreshed by another typing event.
- A typing indicator disappears immediately when the typing partner sends a chat message.
- Typing events are throttled to at most about once per second while the student is actively typing.
- Typing events are sent only when the chat input has non-whitespace text.
- Clearing the chat input clears the student's typing indicator for their partner.
- **Peer Real Name Visibility** starts off when hosting a **Classroom Activity**.
- The teacher can change **Peer Real Name Visibility** while the **Classroom Activity** is live.
- The **Student Page** responds to **Peer Real Name Visibility** changes over the **Realtime Connection**.
- The **Teacher Page** shows the **Student List** and lets a teacher manually pair exactly two students.
- The hosted **Teacher Page** is organized into sections for lobby students, **Active Pairings**, and **Completed Chats**.
- The lobby student section is the primary actionable student list for creating **Pairings**.
- The **Teacher Page** lets the teacher select exactly two available students and create a **Pairing**.
- The **Teacher Page** keeps disconnected lobby students visible during the **Lobby Student Disconnect Timeout** with a **Reconnecting** status.
- The **Teacher Page** does not show a countdown for reconnecting lobby students in the main **Student List**.
- Manual pairing can include reconnecting lobby students after a teacher warning.
- Manual pairing can include one or two reconnecting lobby students after a teacher warning.
- The **Teacher Page** lets the teacher pair all currently available students at once.
- Pairing all students skips reconnecting lobby students.
- Pairing all students includes only connected lobby students.
- Pairing all students randomly pairs available students and leaves one student in the lobby when there is an odd number of available students.
- The **Teacher Page** shows students in an active pairing as unavailable for new pairings.
- Students in **Active Pairings** appear in the **Active Pairings** section rather than the lobby **Student List**.
- The **Teacher Page** shows simple student counts, including total live students, students in the lobby, and students in chats.
- The lobby student count is especially prominent so the teacher can notice students waiting to be paired.
- The **Teacher Page** lets the teacher remove any student from the **Classroom Activity**.
- Removing any student from the **Classroom Activity** requires teacher confirmation.
- A removed student sees a removed-from-activity state with a path back to `/student`.
- A removed student can rejoin the same **Classroom Activity** with the **Join Code**, but must enter **Student Real Name** again.
- Removing a student from an **Active Pairing** immediately ends that **Pairing**.
- Removing a student from an **Active Pairing** creates a **Completed Chat** from any messages.
- When a teacher removes one student from an **Active Pairing**, the partner sees a chat-ended state explaining that the partner was removed.
- The **Teacher Page** lets a teacher end any active pairing.
- The **Student Page** lets a student end only the active pairing they belong to.
- The **Student Page** shows **End Chat** during an **Active Pairing**.
- Ending an **Active Pairing** creates a **Completed Chat**.
- A **Completed Chat** is created only when the ended **Pairing** has at least one chat message.
- When a chat ends, students see a chat-ended state with a button to return to the lobby.
- Students become available for new **Pairings** after returning to the lobby from the chat-ended state.
- The **Teacher Page** shows students in the chat-ended state as unavailable until they return to the lobby.
- Students in the chat-ended state do not appear in the lobby **Student List** until they return to the lobby.
- A disconnected student in the chat-ended state uses the **Lobby Student Disconnect Timeout**.
- If that student reconnects before the timeout, they return to the chat-ended state.
- A lobby or chat-ended student who does not reconnect before the **Lobby Student Disconnect Timeout** is removed from the live **Student List**.
- **Completed Chats** retain student names and **Character Names** even if a student leaves the live **Student List**.
- A removed student can rejoin with the same **Join Code** and **Student Real Name** while the **Classroom Activity** is live.
- Rejoining after removal is treated as a fresh live student in the **Student List**.
- The **Teacher Page** warns before creating a **Pairing** between the same two students from **Pairing History** in the same **Classroom Activity**.
- Pairing all students avoids repeat pairings from **Pairing History** when possible.
- If pairing all students cannot avoid repeat pairings, or avoiding repeats would leave more students unpaired than necessary, the **Teacher Page** warns before creating the repeat pairings.
- **Pairing History** entries without messages are not shown on the **Teacher Page** in version 1.
- The **Teacher Page** shows ended pairing transcripts in **Completed Chats**.
- The **Completed Chats** section shows a count of completed chats.
- **Completed Chats** exist only for the current in-memory **Classroom Activity** in version 1.
- A collapsed **Completed Chat** renders metadata and only the last four chat messages.
- An expanded **Completed Chat** renders a larger fixed-height transcript box with internal scrolling.
- The **Client** should not render the full transcript for a collapsed **Completed Chat** and hide it with clipping.
- Version 1 chat transcripts do not show message timestamps.
- The **Teacher Page** lets a teacher enter or update the transcript email before ending the activity.
- The **Teacher Page** exposes **End Activity** as the explicit way to finish the classroom activity.
- **End Activity** automatically sends the **Transcript Email** when **Teacher Email** is present.
- If **Transcript Email** sending fails, the **Teacher Page** shows the activity-ended state with a retry option.
- A **Transcript Email** failure does not reopen the **Classroom Activity** or allow new students to join.
- The teacher can use **Host another activity** from the activity-ended state to return to `/teacher` and host a fresh **Classroom Activity**.
- **End Activity** is allowed when **Teacher Email** is blank, but the **Teacher Page** asks for confirmation because no **Transcript Email** can be sent.
- **End Activity** immediately ends all **Active Pairings**.
- **End Activity** converts active chat transcripts into **Completed Chats**.
- **End Activity** moves students to an activity-ended state.
- Students do not see transcripts or chat history after **End Activity**.
- A **Transcript Email** includes all **Completed Chats** after **End Activity** converts active chat transcripts.
- A **Transcript Email** includes each participant's **Student Real Name** and **Character Name** for each **Completed Chat**.
- A **Transcript Email** does not include the full **Character List** as a separate section in version 1.
- A **Transcript Email** does not include **Pairing History** entries that did not create **Completed Chats**.
- After **End Activity**, the **Join Code** no longer lets new students join.
- A live **Classroom Activity** remains joinable until **End Activity** or **Teacher Disconnect Timeout** ends it.
- Version 1 does not expose a product-level limit on the number of students in a **Classroom Activity**.
- Closing the teacher browser can trigger a best-effort **Teacher Disconnect**, but **End Activity** is the reliable finish path.
- During the **Teacher Disconnect Timeout**, the **Classroom Activity** remains live and joinable.
- During the **Teacher Disconnect Timeout**, existing students remain in their current states and chats can continue.
- If the teacher reconnects with their **Session ID** before the timeout expires, they resume control of the **Classroom Activity**.
- If the **Teacher Disconnect Timeout** expires, the **Classroom Activity** ends and sends the **Transcript Email** when **Teacher Email** exists.
- The **Student Page** shows when a chat partner has a **Student Disconnect** without immediately ending the active pairing.
- A lobby student is removed from the **Classroom Activity** after a **Lobby Student Disconnect Timeout**.
- Pairing a disconnected lobby student uses a **Disconnected Pairing Timeout**.
- A student who disconnects during an active chat uses a **Chat Reconnect Timeout**.
- During a **Chat Reconnect Timeout** or **Disconnected Pairing Timeout**, the connected partner stays in the chat and sees a reconnect timer.
- Reconnect timers render from server-provided disconnect deadline timestamps.
- Client countdowns are display-only; timeout state changes wait for authoritative server snapshots.
- Tests should prioritize shared/domain behavior and key UI flows over exhaustive rendering details.
- Version 1 should add Vitest for executable shared behavior and flow tests.
- When a reconnect timeout ends a chat, the connected student sees a button to return to the lobby.
- The **Client** uses Socket.IO for the **Realtime Connection**.
- Hosting and resuming a **Classroom Activity** use the **Realtime Connection** in version 1 rather than REST endpoints.
- Student **Join Code** validation and joining use the **Realtime Connection** in version 1 rather than REST endpoints.
- Version 1 does not use REST endpoints to validate **Join Codes** or stale activity links.
- Command-style **Realtime Connection** events use Socket.IO acknowledgements for immediate success or validation errors.
- Command acknowledgements use a standard discriminated union shape for success and error results.
- Command acknowledgement errors include stable machine-readable error codes separate from user-facing copy.
- Realtime event payloads, acknowledgement result types, and snapshot types live in a shared TypeScript workspace package in version 1.
- The shared TypeScript workspace package is named `@frempower/shared`.
- `@frempower/shared` contains shared types and small pure helpers used by both Client and Server.
- `@frempower/shared` contains shared product constants used by both Client and Server.
- Server validation remains authoritative.
- Version 1 uses plain runtime validation functions rather than adding a schema validation library.
- Character name normalization trims whitespace and lowercases values for duplicate validation.
- Stored **Character Names** trim leading and trailing whitespace while preserving casing and internal spacing.
- Student real name normalization trims whitespace and lowercases values for duplicate-name cues.
- Stored **Student Real Names** trim leading and trailing whitespace while preserving casing and internal spacing.
- State changes are received through activity snapshot events after successful commands.
- Version 1 receives full activity snapshots rather than patch events.
- Version 1 uses audience-specific activity snapshots for teachers and students.
- Student snapshots do not include the **Student List** or unrelated **Pairings**.
- The **Client** treats snapshots as the recovery source after reconnects; missed activity, removed, pairing-ended, and chat state should be recovered from the latest audience-specific snapshot.
- Chat messages missed during a brief **Realtime Connection** loss are recovered through the student's next snapshot.
- Typing indicators are ephemeral and may expire during a **Realtime Connection** loss.
- Realtime event names use actor or domain namespaces such as `teacher:*`, `student:*`, and `chat:*`.
- Snapshot events are audience-specific, such as `teacher:activitySnapshot` and `student:activitySnapshot`.
- The **Client** sends **Session ID** through Socket.IO auth on connection.
- Route-specific resume uses explicit realtime commands after connection, such as teacher or student resume events.

## Example dialogue

> **Dev:** "Should this route be optimized for search?"
> **Domain expert:** "Only if it is the **Homepage**. The rest of the **Client** belongs in the **App Shell**."

## Flagged ambiguities

- "client" means the browser-facing **Client**, not a customer or external consumer.
- "teacher" and "student" name open experiences and current-activity participant modes, not access-controlled roles.
- **In-Memory Login** is an internal domain term only. User-facing copy should use actions such as "Host activity", "Join activity", or "Resume activity"; avoid "login", "sign in", and "sign up".
- "student name" should be clarified as **Student Real Name** or **Character Name**.
- The student-facing label for **Student Real Name** is "Your name"; avoid "display name".
- "join code" means the five-digit **Join Code** for a live **Classroom Activity**, not durable account access.
- The user-facing label is **Join Code**, not PIN.
- "activity ID" means the route form of the five-digit **Join Code** in version 1, not a separate durable identifier or user-facing label.
- "socket ID" is transport-level debug information, not a **Session ID** or participant identity.
- Avoid user-facing "saved" language for version 1 activity state. Prefer "updated", "applied", or "retained in server memory for the current process", depending on context.
