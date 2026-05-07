# AGENTS.md — Universal AI Agent Instructions

This project (Thoet Thai — a hyperlocal food delivery app) uses a shared-context system across multiple AI CLIs (Claude Code, Gemini CLI, and any future tools such as Codex, Cursor, Aider, etc.).

This file is the universal fallback for any AI tool that does not auto-load `CLAUDE.md`. If your tool already reads `CLAUDE.md`, that file contains the same instructions plus full architecture and coding standards.

---

## Before starting any work

1. Read `CLAUDE.md` (project root) — architecture, coding standards, monorepo layout, design system, order flow.
2. Read `PROJECT_CONTEXT.md` (project root) — current state, last session, in-progress work, next-up backlog, locked decisions, known bugs.

Both files live at the project root. Neither is optional.

---

## Before ending your session

Update `PROJECT_CONTEXT.md` so the next agent can resume cleanly:

1. **Overwrite section 2 "Last Session"** with: today's date, your agent/CLI name, bullets of what you did, files touched (full paths), what you tested or verified.
2. **Move the previous "Last Session" content** to the top of section 12 "Session History" — append only, never delete history.
3. **Update section 3 "In-Progress"** — describe any unfinished work, where to resume, and the next concrete step.
4. **Update section 4 "Next Up"** if priorities shifted or new work appeared.
5. **Update section 6 "Known Bugs / Blockers"** if you found or cleared bugs.
6. **Append to section 5 "Locked Decisions"** only when a significant architectural or library choice was made.

---

## Hard rules

- **DO NOT** modify or remove entries in section 5 "Locked Decisions" without asking the user first.
- **DO NOT** delete content from section 12 "Session History" — append-only.
- **All edits to `CLAUDE.md`, `PROJECT_CONTEXT.md`, and `AGENTS.md` must be in English** so any model can read them reliably.
- Stay within the project's P0 scope as defined in `PROJECT_CONTEXT.md` section 4 — do not invent P1/P2 features unless asked.

---

## Language rules

| Where | Language |
|---|---|
| File contents (CLAUDE.md, PROJECT_CONTEXT.md, AGENTS.md) | English |
| Code comments | English |
| Commit messages | English |
| UI strings in `frontend/` | Thai (per design system in CLAUDE.md) |
| Error messages returned by backend | Thai (user-facing, actionable) |
| Conversation with the user in chat | Thai |

---

## Quick orientation

- **Stack:** Next.js 14 (App Router) + TypeScript on the frontend; FastAPI + SQLAlchemy 2.0 on the backend; PostgreSQL 15 (Supabase) + PostGIS; Redis (Upstash); Supabase Realtime / Storage; LINE LIFF for auth.
- **Roles:** customer, merchant, rider, admin — each in its own Next.js route group.
- **How to run:** see `PROJECT_CONTEXT.md` section 7.
- **Test users:** see `PROJECT_CONTEXT.md` section 8.

For everything else, read `CLAUDE.md` and `PROJECT_CONTEXT.md`.
