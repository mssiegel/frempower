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

**Pairing**:
An assignment that connects students so they can chat in real time.
_Avoid_: Match, group

**Active Pairing**:
A pairing that currently allows its two students to exchange chat messages.
_Avoid_: Open match, live group

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

**Student Disconnect Timeout**:
The two-minute grace period after a student disconnects before the server ends that student's active pairing.
_Avoid_: Session timeout, logout timeout

**Realtime Server**:
The Socket.IO event layer that manages live participant, pairing, and chat updates.
_Avoid_: WebSocket server, polling server

**In-Memory Login**:
A lightweight action that stores participant information in server memory without creating a durable account.
_Avoid_: Authentication, sign-up, account creation

**Display Name**:
The name a chat participant provides to identify themselves during the current server process.
_Avoid_: Username, account name

## Relationships

- A **Teacher** can create **Pairings** between **Students**.
- A **Pairing** contains exactly two **Students** in version 1.
- A **Pairing** enables real-time chat between assigned **Students**.
- A **Student** can belong to at most one **Active Pairing** at a time.
- A **Teacher** can end any **Active Pairing**.
- A **Student** can end only the **Active Pairing** they belong to.
- Ending an **Active Pairing** creates a **Completed Chat** in server memory.
- An **In-Memory Login** creates or updates a **Chat Participant** only for the current running server process.
- A **Teacher** can join a **Classroom Activity** without a **Display Name**.
- A **Student** must provide a **Display Name** so the teacher can identify them.
- Version 1 does not persist **Chat Participants**, **Pairings**, or chat data in a database.
- A **Classroom Activity** can have a **Teacher Email** supplied when the activity is created or during the activity.
- Ending a **Classroom Activity** sends one **Transcript Email** to the **Teacher Email**.
- Clicking **End Activity** is the reliable way to end a **Classroom Activity**.
- A browser close or lost connection can end a **Classroom Activity** only after a **Teacher Disconnect Timeout**.
- A browser close or lost connection can end a student's **Active Pairing** only after a **Student Disconnect Timeout**.
- The server uses Node.js and Express for HTTP behavior.
- The server uses Socket.IO as the **Realtime Server**.

## Example dialogue

> **Dev:** "Does logging in create a user account?"
> **Domain expert:** "No. **In-Memory Login** only identifies a **Chat Participant** while the server is running."

## Flagged ambiguities

- "login" means **In-Memory Login**, not durable authentication.
- "name" means **Display Name**, not a unique account identifier.
- "saved" means retained in server memory for the current process, not stored in a database.
- "teacher" and "student" mean current-activity participant modes, not access-controlled roles.
