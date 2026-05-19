# Server Context

This context captures backend, API, data, auth, integrations, jobs, and operational domain language for Frempower.

## Language

**Chat Participant**:
A teacher or student who has identified themselves for the current running server process.
_Avoid_: User, account, member

**Teacher**:
A chat participant who can pair students for chats.
_Avoid_: Admin, instructor account, access-controlled role

**Student**:
A chat participant who can be paired into a chat by a teacher.
_Avoid_: Learner account, pupil, access-controlled role

**Student Real Name**:
The name a student enters so the teacher can identify them during the current classroom activity.
_Avoid_: Username, account name, display name

**Character Name**:
The roleplaying name assigned to a student for a specific pairing.
_Avoid_: Avatar, persona, nickname

**Character List**:
The teacher-provided set of character names available for automatic assignment to students.
_Avoid_: Cast list, roster, role list

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

**Pairing**:
An assignment that connects students so they can chat in real time.
_Avoid_: Match, group

**Active Pairing**:
A pairing that currently allows its two students to exchange chat messages.
_Avoid_: Open match, live group

**Pairing History**:
The in-memory record of student pairings created during a classroom activity, including pairings that ended without messages.
_Avoid_: Completed chats, chat history

**Completed Chat**:
The in-memory transcript retained after an active pairing ends.
_Avoid_: Saved chat, archived chat

**Classroom Activity**:
The teacher-led session that contains the in-memory participants, pairings, and completed chats for a live activity.
_Avoid_: Class, room, lesson

**Teacher Email**:
The email address supplied by the teacher for receiving the classroom activity transcript.
_Avoid_: Account email, login email

**Transcript Email**:
An email sent to the teacher with transcripts from completed chats in a classroom activity.
_Avoid_: Export, report

**Teacher Disconnect Timeout**:
The two-minute grace period after a teacher disconnects before the server treats the classroom activity as ended.
_Avoid_: Session timeout, logout timeout

**Lobby Student Disconnect Timeout**:
The 15-second grace period after a lobby student disconnects before the student is removed from the classroom activity.
_Avoid_: Session timeout, logout timeout

**Disconnected Pairing Timeout**:
The 30-second grace period for a pairing created with a disconnected lobby student before the server ends that student's active pairing.
_Avoid_: Middle grace period, paired-lobby timeout

**Chat Reconnect Timeout**:
The 90-second grace period after a student disconnects during an active chat before the server ends that student's active pairing.
_Avoid_: Session timeout, logout timeout

**Realtime Server**:
The Socket.IO event layer that manages live participant, pairing, and chat updates.
_Avoid_: WebSocket server, polling server

**In-Memory Login**:
A lightweight action that stores participant information in server memory without creating a durable account.
_Avoid_: Authentication, sign-up, account creation

## Relationships

- A **Teacher** can create **Pairings** between **Students**.
- A **Pairing** contains exactly two **Students** in version 1.
- A **Teacher** can create one **Pairing** manually from exactly two available students.
- Manual pairing can include reconnecting lobby students after a teacher warning in the **Client**.
- Manual pairing can include one or two reconnecting lobby students after a teacher warning in the **Client**.
- A **Teacher** can pair all currently available students at once.
- Pairing all students skips reconnecting lobby students.
- Pairing all students includes only connected lobby students.
- Pairing all students randomly pairs available students and leaves one student unpaired when there is an odd number of available students.
- A **Pairing** enables real-time chat between assigned **Students**.
- A **Student** can belong to at most one **Active Pairing** at a time.
- The teacher-facing activity snapshot includes lobby students, **Active Pairings**, and **Completed Chats**.
- A **Teacher** can remove any **Student** from the **Classroom Activity**.
- Removing any **Student** from the **Classroom Activity** requires teacher confirmation in the **Client**.
- A removed **Student** is notified that they were removed from the **Classroom Activity**.
- A removed **Student** can rejoin the same **Classroom Activity** with the **Join Code**, but must provide **Student Real Name** again.
- Removing a **Student** from an **Active Pairing** immediately ends that **Pairing**.
- Removing a **Student** from an **Active Pairing** creates a **Completed Chat** from any messages.
- A **Teacher** can end any **Active Pairing**.
- A **Student** can end only the **Active Pairing** they belong to.
- Students can use **End Chat** during an **Active Pairing**.
- Ending an **Active Pairing** creates a **Completed Chat** in server memory.
- A **Completed Chat** is created only when the ended **Pairing** has at least one chat message.
- Ending an **Active Pairing** moves its students to a chat-ended state before they return to the lobby.
- Students become available for new **Pairings** after returning to the lobby from the chat-ended state.
- Students in the chat-ended state are unavailable for new **Pairings**.
- Students in the chat-ended state are not included in the lobby student list until they return to the lobby.
- A disconnected student in the chat-ended state uses the **Lobby Student Disconnect Timeout**.
- If that student reconnects before the timeout, they return to the chat-ended state.
- A lobby or chat-ended student who does not reconnect before the **Lobby Student Disconnect Timeout** is removed from the live student snapshot.
- **Completed Chats** retain student names and **Character Names** even if a student leaves the live student snapshot.
- A removed student can rejoin with the same **Join Code** and **Student Real Name** while the **Classroom Activity** is live.
- Rejoining after removal is treated as a fresh live student in the live student snapshot.
- Creating a **Pairing** between the same two students from **Pairing History** in the same **Classroom Activity** requires a teacher warning in the **Client**.
- Pairing all students avoids repeat pairings from **Pairing History** when possible.
- If pairing all students cannot avoid repeat pairings, or avoiding repeats would leave more students unpaired than necessary, the **Client** requires teacher confirmation before creating the repeat pairings.
- **Pairing History** entries without messages are not teacher-facing in version 1.
- An **In-Memory Login** creates or updates a **Chat Participant** only for the current running server process.
- A **Teacher** hosts a **Classroom Activity** by providing a **Character List** and optional **Teacher Email**.
- A teacher **Session ID** can host at most one live **Classroom Activity** at a time.
- Multiple teachers can each host their own live **Classroom Activity** at the same time.
- Hosting a **Classroom Activity** creates a five-digit **Join Code**.
- In version 1, the **Activity ID** is the same five-digit value as the **Join Code**.
- In version 1, the server can use the **Activity ID** as the in-memory activity key.
- **Join Codes** are numeric-only and displayed as five plain digits without separators.
- **Join Codes** are generated in the range `10000` through `99999` to avoid leading zeros.
- **Join Codes** are generated by the server, not chosen by the teacher.
- The server retries **Join Code** generation when a generated code is already reserved by a live **Classroom Activity**.
- A **Join Code** remains reserved until its **Classroom Activity** ends or times out.
- Students enter the **Join Code** to join the teacher's **Classroom Activity**.
- A student must provide a valid **Join Code** before providing a **Student Real Name**.
- If a student provides a **Join Code** with no live **Classroom Activity**, the server rejects the join and does not create a **Chat Participant**.
- A participant's **Session ID** identifies them across **Realtime Server** reconnects and same-tab page refreshes during the current server process.
- A **Session ID** is stored in sessionStorage so it is not shared across multiple browser tabs.
- The server generates **Session IDs** and returns them to the **Client** during host or join commands when needed.
- **Session IDs** are random opaque values and are not derived from **Join Codes**, socket IDs, or participant names.
- Students, pairings, and completed chats use opaque **Entity IDs** for client actions and rendering.
- A teacher who reconnects with a valid **Session ID** rejoins their live **Classroom Activity**.
- If the server no longer recognizes the teacher **Session ID**, the teacher must host a new **Classroom Activity**.
- The **Activity ID** or **Join Code** alone never authorizes teacher control.
- Version 1 does not support teacher takeover without the matching teacher **Session ID**.
- A student who reconnects with a valid **Session ID** rejoins the same **Classroom Activity**.
- If the server no longer recognizes the student **Session ID**, the student must join a **Classroom Activity** again.
- A student can join from an **Activity ID** route by providing a **Student Real Name** after the server confirms the activity exists.
- A Socket.IO socket ID is never used as a participant identity because it is ephemeral.
- Hosting a **Classroom Activity** requires at least two distinct non-empty **Character Names**.
- The teacher can edit the **Character List** while the **Classroom Activity** is live.
- Edits to the **Character List** affect only future **Pairings**.
- Existing **Active Pairings** and **Completed Chats** keep the **Character Names** they already received.
- A draft **Character List** can temporarily have fewer than two distinct non-empty **Character Names** while the teacher is editing in the **Client**.
- The server accepts hosting or applied **Character List** changes only when there are at least two distinct non-empty **Character Names**.
- **Character Name** duplicate validation trims whitespace and compares names case-insensitively.
- Applied **Character Names** preserve the teacher's chosen casing for display.
- A **Student** must provide a **Student Real Name** so the teacher can identify them.
- Duplicate **Student Real Names** are allowed in the same **Classroom Activity**.
- The same **Student Real Name** can join the same **Classroom Activity** from multiple browser tabs as separate live students.
- Each student receives an automatically assigned **Character Name** when the teacher creates a **Pairing** in version 1.
- **Character Names** are scoped to a **Pairing**, not to a student for the whole **Classroom Activity**.
- Two students in the same **Pairing** cannot have the same **Character Name**.
- Students in different **Pairings** can have the same **Character Name**.
- **Character Names** are assigned randomly from the **Character List** for each **Pairing**.
- The teacher can see both each student's **Student Real Name** and assigned **Character Name**.
- **Character Names** exist only for **Active Pairings** and **Completed Chats**, not for unpaired lobby students.
- Students see a chat partner's **Character Name**.
- Students see a chat partner's **Student Real Name** only when **Peer Real Name Visibility** is enabled.
- Chat messages are attributed by **Character Name** in the student-facing chat.
- The server rejects empty or whitespace-only chat messages.
- Stored chat messages trim leading and trailing whitespace while preserving internal spacing.
- The server rejects chat messages longer than 75 characters in version 1.
- The 75-character chat message limit applies after trimming leading and trailing whitespace.
- Version 1 uses JavaScript string length for the 75-character chat message limit.
- Chat messages can include native keyboard emojis.
- Version 1 chat supports text and native keyboard emojis only; images, files, links, and rich attachments are out of scope.
- URLs in chat messages are treated as plain text in version 1.
- Students cannot edit or delete chat messages in version 1.
- Typing indicators are ephemeral realtime chat events.
- A typing indicator expires after three seconds unless refreshed by another typing event.
- Sending a chat message clears that student's typing indicator for their partner.
- Typing events are throttled by the **Client** to at most about once per second while the student is actively typing.
- Typing events are sent only when the chat input has non-whitespace text.
- Clearing the chat input clears the student's typing indicator for their partner.
- Students do not receive the **Student List** or other joined students while waiting to be paired.
- Students do not leave a **Classroom Activity** through an explicit lobby action in version 1.
- All students in the lobby are ready to chat in version 1.
- **Peer Real Name Visibility** starts off when hosting a **Classroom Activity**.
- The teacher can change **Peer Real Name Visibility** while the **Classroom Activity** is live.
- Version 1 does not persist **Chat Participants**, **Pairings**, or chat data in a database.
- Chat messages and **Completed Chats** live in server memory only in version 1.
- Completed chat snapshots include enough data for the **Client** to render a preview without rendering the full transcript in collapsed cards.
- Version 1 chat transcripts do not include teacher-facing message timestamps.
- Active pairing snapshots include enough recent messages for compact teacher previews without requiring the **Client** to render the full transcript in collapsed cards.
- Teachers do not send messages into student chats in version 1.
- Teachers cannot delete or hide student chat messages in version 1.
- Teachers cannot pause a **Classroom Activity** in version 1.
- Teachers cannot lock a **Classroom Activity** to prevent new students from joining in version 1.
- Students cannot report messages in version 1.
- A **Classroom Activity** can have a **Teacher Email** supplied when the activity is created or during the activity.
- The teacher can enter or update **Teacher Email** while the **Classroom Activity** is live.
- Ending a **Classroom Activity** sends one **Transcript Email** to the **Teacher Email**.
- **End Activity** automatically sends the **Transcript Email** when **Teacher Email** is present.
- If **Transcript Email** sending fails, the ended **Classroom Activity** remains in memory so the teacher can retry delivery.
- A **Transcript Email** failure does not reopen the **Classroom Activity** or allow new students to join.
- After ending one **Classroom Activity**, the same teacher can host a fresh **Classroom Activity** with a new **Join Code**.
- Ending a **Classroom Activity** without a **Teacher Email** is allowed and does not send a **Transcript Email**.
- Ending a **Classroom Activity** immediately ends all **Active Pairings**.
- Ending a **Classroom Activity** converts active chat transcripts into **Completed Chats**.
- Ending a **Classroom Activity** releases the **Join Code** and prevents new students from joining that activity.
- A live **Classroom Activity** remains joinable until **End Activity** or **Teacher Disconnect Timeout** ends it.
- Version 1 does not impose a product-level limit on the number of students in a **Classroom Activity**.
- A **Transcript Email** includes all **Completed Chats** after **End Activity** converts active chat transcripts.
- A **Transcript Email** includes each participant's **Student Real Name** and **Character Name** for each **Completed Chat**.
- A **Transcript Email** does not include the full **Character List** as a separate section in version 1.
- A **Transcript Email** does not include **Pairing History** entries that did not create **Completed Chats**.
- Students do not receive transcripts or chat history after **End Activity**.
- Clicking **End Activity** is the reliable way to end a **Classroom Activity**.
- A browser close or lost connection can end a **Classroom Activity** only after a **Teacher Disconnect Timeout**.
- During the **Teacher Disconnect Timeout**, the **Classroom Activity** remains live and joinable.
- During the **Teacher Disconnect Timeout**, existing students remain in their current states and chats can continue.
- If the teacher reconnects with their **Session ID** before the timeout expires, they resume control of the **Classroom Activity**.
- If the **Teacher Disconnect Timeout** expires, the server ends the **Classroom Activity** and sends the **Transcript Email** when **Teacher Email** exists.
- A browser close or lost connection removes a lobby student only after a **Lobby Student Disconnect Timeout**.
- Pairing a disconnected lobby student uses a **Disconnected Pairing Timeout**.
- A browser close or lost connection during an active chat can end a student's **Active Pairing** only after a **Chat Reconnect Timeout**.
- The server uses Node.js and Express for HTTP behavior.
- The server uses Socket.IO as the **Realtime Server**.
- Server domain operations live in an in-memory activity store or service module separate from Socket.IO event handlers.
- Socket.IO event handlers stay thin and delegate classroom activity rules to the activity store or service.
- The activity store or service owns disconnect timer scheduling and cancellation.
- The activity store or service does not import or directly use Socket.IO.
- The activity store or service exposes state-change callbacks so the Socket.IO layer can broadcast snapshots.
- The activity store or service stores **Session IDs** and classroom activity state, not socket IDs as identity.
- The Socket.IO layer can maintain connection routing details that map **Session IDs** to current socket connections.
- One **Session ID** can have multiple simultaneous socket connections.
- A participant is considered connected while at least one socket for their **Session ID** is connected.
- Disconnect timers start only when the last socket for a **Session ID** disconnects.
- Reconnecting with a **Session ID** cancels any active disconnect timer for that participant.
- The **Realtime Server** uses Socket.IO heartbeat/ping-pong settings to detect dead connections; TCP keepalive is not sufficient for classroom reconnect behavior.
- The **Realtime Server** scopes delivery with Socket.IO rooms for **Session IDs**, teacher activity updates, student snapshots, and active **Pairings**.
- Chat messages are recorded in in-memory pairing state before realtime delivery so reconnecting students can recover missed messages from snapshots.
- During reconnect windows, missed removed, ended, pairing-ended, and chat state must be recoverable from authoritative snapshots.
- Snapshots include server-computed disconnect deadline timestamps when the **Client** needs to render a countdown.
- The server does not broadcast every second only to update countdown displays.
- Timeout state changes are authoritative only when the server timer fires and broadcasts updated snapshots.
- Tests should prioritize activity service/domain logic before Socket.IO handler wiring.
- Version 1 should add Vitest for executable server and shared package tests.
- Disconnect timeout tests should use fake timers or injectable timer dependencies.
- The activity service uses an injectable or centralized clock for deterministic deadline tests.
- Pair-all and **Character Name** assignment randomness is isolated behind injectable random or shuffle helpers for deterministic tests.
- **Join Code** generation is isolated behind an injectable helper so collision retry behavior can be tested deterministically.
- Hosting and resuming a **Classroom Activity** use **Realtime Server** events in version 1 rather than REST endpoints.
- Student **Join Code** validation and joining use **Realtime Server** events in version 1 rather than REST endpoints.
- Version 1 does not add REST endpoints for validating **Join Codes** or stale activity links.
- Command-style **Realtime Server** events use Socket.IO acknowledgements for immediate success or validation errors.
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
- State changes are broadcast through activity snapshot events after successful commands.
- Version 1 broadcasts full activity snapshots rather than patch events.
- Version 1 uses audience-specific activity snapshots for teachers and students.
- Teacher snapshots include teacher-facing activity state such as the **Character List**, **Join Code**, lobby students, **Active Pairings**, **Completed Chats**, previews, and **Peer Real Name Visibility**.
- Student snapshots include only the receiving student's state and allowed chat context.
- Realtime event names use actor or domain namespaces such as `teacher:*`, `student:*`, and `chat:*`.
- Snapshot events are audience-specific, such as `teacher:activitySnapshot` and `student:activitySnapshot`.
- The **Client** sends **Session ID** through Socket.IO auth on connection.
- Route-specific resume uses explicit realtime commands after connection, such as teacher or student resume events.

## Example dialogue

> **Dev:** "Does logging in create a user account?"
> **Domain expert:** "No. **In-Memory Login** only identifies a **Chat Participant** while the server is running."

## Flagged ambiguities

- **In-Memory Login** is an internal domain term only. User-facing copy should use actions such as "Host activity", "Join activity", or "Resume activity"; avoid "login", "sign in", and "sign up".
- "student name" should be clarified as **Student Real Name** or **Character Name**.
- The student-facing label for **Student Real Name** is "Your name"; avoid "display name".
- "join code" means the five-digit **Join Code** for a live **Classroom Activity**, not durable account access.
- The user-facing label is **Join Code**, not PIN.
- "activity ID" means the route form of the five-digit **Join Code** in version 1, not a separate durable identifier or user-facing label.
- "socket ID" is transport-level debug information, not a **Session ID** or participant identity.
- Avoid user-facing "saved" language for version 1 activity state. Prefer "updated", "applied", or "retained in server memory for the current process", depending on context.
- "teacher" and "student" mean current-activity participant modes, not access-controlled roles.
