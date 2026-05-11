# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root. It points at one `CONTEXT.md` per context.
- **`client/CONTEXT.md`** for frontend, product, and UI work.
- **`server/CONTEXT.md`** for backend, API, persistence, and integration work.
- **`client/docs/adr/`** for client-side architectural decisions.
- **`server/docs/adr/`** for server-side architectural decisions.
- **`docs/adr/`** for system-wide architectural decisions, if it exists.

If a change crosses the client/server boundary, read both context files and relevant ADRs from both sides.

If any of these files don't exist, proceed silently. Don't flag their absence or suggest creating them upfront. The producer skill (`/grill-with-docs`) creates and expands them when terms or decisions get resolved.

## File structure

This repo uses a multi-context layout:

```text
/
|-- CONTEXT-MAP.md
|-- client/
|   |-- CONTEXT.md
|   `-- docs/adr/
`-- server/
    |-- CONTEXT.md
    `-- docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept in an issue title, refactor proposal, hypothesis, test name, or implementation note, use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use, or there's a real gap to resolve with `/grill-with-docs`.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> Contradicts ADR-0007 (event-sourced orders), but worth reopening because...
