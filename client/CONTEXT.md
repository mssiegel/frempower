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
The live list of students who have completed display-name-only login during the current server process.
_Avoid_: Roster, class list

**Display Name**:
The name a visitor enters to identify themselves during the current session.
_Avoid_: Username, account name

**Completed Chats**:
The teacher-facing section that lists chat transcripts from pairings that have ended during the current server process.
_Avoid_: Chat history, archive

**End Activity**:
The teacher action that finishes the current classroom activity and requests a transcript email.
_Avoid_: Finish class, close room

**Teacher Disconnect**:
A best-effort signal that the teacher may have left by closing the browser or losing connection.
_Avoid_: Logout, hard close

**Student Disconnect**:
A best-effort signal that a student may have left by closing the browser or losing connection.
_Avoid_: Logout, hard close

**Realtime Connection**:
The Socket.IO connection used by the client to receive live activity, pairing, and chat updates.
_Avoid_: WebSocket, polling stream

## Relationships

- The **Client** is primarily a plain SPA.
- The **Homepage** is the only part of the **Client** with an explicit SEO requirement.
- The **Homepage** lives inside the same Vite application as the **App Shell**.
- The **App Shell** can prioritize interaction speed and application ergonomics over search indexing.
- The **Homepage** is served at `/`.
- The **Teacher Page** is served at `/teacher`.
- The **Student Page** is served at `/student`.
- The **Teacher Page** and **Student Page** are open experiences anyone can visit.
- The **Teacher Page** and **Student Page** use a display-name-only login for version 1.
- The **Teacher Page** shows the **Student List** and lets a teacher manually pair exactly two students.
- The **Teacher Page** shows students in an active pairing as unavailable for new pairings.
- The **Teacher Page** lets a teacher end any active pairing.
- The **Student Page** lets a student end only the active pairing they belong to.
- The **Teacher Page** shows ended pairing transcripts in **Completed Chats**.
- The **Teacher Page** lets a teacher enter or update the transcript email before ending the activity.
- The **Teacher Page** exposes **End Activity** as the explicit way to finish the classroom activity.
- Closing the teacher browser can trigger a best-effort **Teacher Disconnect**, but **End Activity** is the reliable finish path.
- The **Student Page** shows when a chat partner has a **Student Disconnect** without immediately ending the active pairing.
- The **Client** uses Socket.IO for the **Realtime Connection**.

## Example dialogue

> **Dev:** "Should this route be optimized for search?"
> **Domain expert:** "Only if it is the **Homepage**. The rest of the **Client** belongs in the **App Shell**."

## Flagged ambiguities

- "client" means the browser-facing **Client**, not a customer or external consumer.
- "teacher" and "student" name open experiences, not access-controlled roles.
- "login" means entering a **Display Name**, not proving identity.
