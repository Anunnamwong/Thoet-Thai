# CLAUDE.md — Project Intelligence File

> **This file is loaded by all AI/CLI agents working on this project (Claude Code, Gemini CLI, etc.).**
> CLAUDE.md = how to think / coding standards / architecture (mostly static).
> PROJECT_CONTEXT.md = current state / in-progress work / next-up backlog (dynamic, source of truth).

---

## MANDATORY — Read Before Every Session

**This block applies to every AI/CLI agent.** Gemini CLI is verified to load this file from the project root; Claude Code loads it natively. Other tools should follow `AGENTS.md`.

### Before starting any work
1. Read `PROJECT_CONTEXT.md` (project root) **in full** — it has the current state, in-progress work, locked decisions, and known bugs from prior sessions.
2. Read this file (`CLAUDE.md`) for coding standards, architecture, and design system.

### Before ending your session
Update `PROJECT_CONTEXT.md` so the next agent (and the user) can pick up cleanly:

1. **Overwrite section 2 "Last Session"** with what you just did. Include: today's date, your agent name (e.g., "Claude Code", "Gemini CLI"), bullets of what was accomplished, files touched (full paths), and what was tested or verified.
2. **Move the previous content of section 2** to the top of section 12 "Session History" (append-only — never delete history).
3. **Update section 3 "In-Progress"** — describe any unfinished work, the file to resume from, and the next concrete step. If you finished cleanly, leave a brief note saying so.
4. **Update section 4 "Next Up"** if priorities shifted, tasks were completed, or new work was discovered.
5. **Update section 6 "Known Bugs / Blockers"** if you found new bugs or fixed/cleared old ones.
6. **Append to section 5 "Locked Decisions"** only when a significant architectural or library choice was made.

### Hard rules
- **DO NOT** modify or remove entries in section 5 "Locked Decisions" without asking the user first.
- **DO NOT** delete content from section 12 "Session History" — it is append-only.
- **All edits to `PROJECT_CONTEXT.md`, `CLAUDE.md`, and `AGENTS.md` must be in English** so any model can read them reliably.
- **Conversation with the user in chat is in Thai** — but file contents stay English.
- UI strings inside `frontend/` follow the Thai-first design system below — that rule is unchanged.

---

## AI Orchestration — Claude → Gemini handoff

The user's preferred workflow is: **Claude Code is the orchestrator; Gemini CLI is the code writer.** The goal is to reduce Claude token/quota usage while keeping output quality the same as if Claude had written the code itself.

### Role split
- **Claude Code** = planner, reviewer, decision-maker. Reads context, designs the approach, writes self-contained prompts for Gemini, verifies Gemini's output against the conventions in this file, and updates `PROJECT_CONTEXT.md` at session end.
- **Gemini CLI** = code writer for easy/medium delegated tasks. Receives a self-contained prompt from Claude and edits files directly via `--approval-mode auto_edit`.

### Claude decides per task — does NOT ask the user every time

| Delegate to Gemini | Claude does it itself |
|---|---|
| Spec is clear and self-contained | Debugging an unknown root cause |
| Bulk / repetitive (CRUD, boilerplate) | Refactor across multiple flows |
| Mock → real API swaps | Security/auth/payment-sensitive code |
| Forms / components from a known design | Architectural decisions, locked-decision changes |
| Migrations, schema additions following an existing pattern | Anything ambiguous or trade-off heavy |

If Gemini's output is wrong or low quality, Claude takes over directly — do not loop with Gemini more than once on the same task.

### Delegation command (PowerShell)

```powershell
gemini -p "<self-contained prompt>" --approval-mode yolo -o text
```

- `-p` → headless one-shot
- `--approval-mode yolo` → auto-approve ALL tools (file edits AND shell). This is required for headless mode — `auto_edit` only auto-approves edit tools, so any shell call Gemini wants to make (ls, grep, npm, etc.) hangs forever waiting for a confirmation prompt that headless mode can't answer. The hang manifests as a frozen "working" indicator that never resolves; observed 2026-05-02 hanging > 20 minutes.
- `-o text` → plain text output (smaller, easier to parse)
- The first ~2 lines of stderr ("256-color", "Ripgrep") are harmless warnings — filter with `Select-Object -Last N` in PowerShell.
- Gemini auto-loads `CLAUDE.md` from project root, so prompts do not need to repeat conventions — reference them.

### Required guardrails when using yolo mode

Yolo lets Gemini run anything, so the safety has to come from the prompt and the timeout:

1. **Constrain the prompt explicitly.** End every delegation prompt with a "Do NOT" block that includes:
   - Do not run shell commands. Do not install packages. Do not run tests.
   - Do not create files outside the listed paths. Do not delete files.
   - Do not modify files outside the listed paths.
2. **Hard timeout.** Always invoke with a wall-clock budget ≤ 5 min (PowerShell tool `timeout: 300000`). If Gemini exceeds it, kill the process and finish the task in Claude — do not retry.
3. **Verify after every run.** Read each changed file. Run the relevant type-check / import-smoke-test before declaring the task done.
4. **One shot only.** If Gemini fails or hangs once on a task, switch to Claude. Do not loop with Gemini on the same task.

### Prompt template Claude must use when delegating

Each delegation prompt should be self-contained and include:
1. **Goal** — one sentence on what to build/change.
2. **Files to touch** — exact absolute or repo-relative paths.
3. **Spec** — endpoint signature, schema fields, UI behavior, etc. Be explicit; do not assume Gemini will infer.
4. **Conventions to follow** — point to the relevant section of `CLAUDE.md` (e.g. "follow API Response Format and Backend (Python / FastAPI) sections").
5. **Acceptance criteria** — what "done" looks like (e.g. "type-check passes", "endpoint returns 200 on happy path").
6. **What NOT to do** — explicitly out-of-scope items, so Gemini does not over-reach.

### Verification (mandatory after every Gemini run)
- Read each file Gemini changed.
- Check naming, imports, error format, Thai messages — must match `CLAUDE.md`.
- For frontend changes, run `npm run type-check` in `frontend/`.
- For backend changes, ensure schemas/services/routers are wired and imports compile.
- Only after verification does Claude report the task as done.

---

## Project Overview

**App Name:** [APP_NAME] (TBD — placeholder: กินกัน)
**Type:** Hyperlocal food delivery platform
**Location:** ตำบลเทอดไทย, อำเภอแม่ฟ้าหลวง, จังหวัดเชียงราย
**Target Users:** ชาวบ้านในตำบล (ไทย, ไทใหญ่, อาข่า, ลาหู่, จีนยูนนาน)
**Developer:** Solo developer
**Language:** Thai-first (UI copy ทั้งหมดเป็นภาษาไทย)

## Architecture

```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
Backend:   FastAPI (Python 3.12) + SQLAlchemy 2.0 + Pydantic v2
Database:  PostgreSQL 15 (Supabase) + PostGIS
Cache:     Redis (Upstash)
Realtime:  Supabase Realtime
Auth:      LINE LIFF SDK → JWT (access + refresh)
Storage:   Supabase Storage (images)
Deploy:    Vercel (frontend) + Railway (backend) + Supabase (db)
```

## Monorepo Structure

```
project/
├── CLAUDE.md                  ← YOU ARE HERE
├── frontend/                  ← Next.js 14 app
│   ├── app/
│   │   ├── (customer)/        ← route group: ลูกค้า
│   │   │   ├── page.tsx            home
│   │   │   ├── shop/[id]/page.tsx  shop detail + menu
│   │   │   ├── cart/page.tsx       cart
│   │   │   ├── checkout/page.tsx   checkout
│   │   │   ├── payment/page.tsx    PromptPay QR
│   │   │   ├── orders/page.tsx     order history
│   │   │   ├── tracking/[id]/page.tsx  realtime tracking
│   │   │   ├── profile/page.tsx    profile
│   │   │   └── layout.tsx          customer layout + bottom nav
│   │   ├── (merchant)/        ← route group: ร้านค้า
│   │   │   ├── dashboard/page.tsx  today overview
│   │   │   ├── orders/page.tsx     active orders
│   │   │   ├── menu/page.tsx       menu CRUD
│   │   │   ├── menu/[id]/page.tsx  edit menu item
│   │   │   ├── hours/page.tsx      shop hours
│   │   │   ├── revenue/page.tsx    revenue + settlement
│   │   │   └── layout.tsx          merchant layout + bottom nav
│   │   ├── (rider)/           ← route group: ไรเดอร์
│   │   │   ├── dashboard/page.tsx  online/offline + job
│   │   │   ├── job/[id]/page.tsx   active delivery
│   │   │   ├── earnings/page.tsx   earnings
│   │   │   ├── history/page.tsx    job history
│   │   │   └── layout.tsx          rider layout
│   │   ├── (admin)/           ← route group: admin
│   │   │   ├── dashboard/page.tsx  live monitor
│   │   │   ├── orders/page.tsx     order management
│   │   │   ├── merchants/page.tsx  merchant approval
│   │   │   ├── riders/page.tsx     rider approval
│   │   │   ├── settlement/page.tsx payouts
│   │   │   └── layout.tsx          admin sidebar layout
│   │   ├── legal/
│   │   │   ├── terms/page.tsx      Terms of Service
│   │   │   ├── privacy/page.tsx    Privacy Policy (PDPA)
│   │   │   └── refund/page.tsx     Refund Policy
│   │   ├── layout.tsx         ← root layout (fonts, providers)
│   │   ├── page.tsx           ← landing / role router
│   │   ├── not-found.tsx      ← 404
│   │   ├── error.tsx          ← 500
│   │   └── middleware.ts      ← auth + role guard
│   ├── components/
│   │   ├── ui/                ← shadcn/ui (Button, Input, etc.)
│   │   └── shared/            ← custom (OrderStatusBadge, etc.)
│   ├── lib/
│   │   ├── api.ts             ← API client wrapper
│   │   ├── liff.ts            ← LINE LIFF init
│   │   ├── supabase.ts        ← Supabase client
│   │   ├── promptpay.ts       ← QR generation
│   │   └── utils.ts           ← formatters, helpers
│   ├── stores/
│   │   ├── cart.ts            ← cart state (Zustand)
│   │   ├── auth.ts            ← auth state
│   │   └── location.ts        ← rider GPS state
│   ├── types/                 ← shared TypeScript types
│   ├── public/                ← static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   └── .env.local.example
├── backend/                   ← FastAPI app
│   ├── app/
│   │   ├── main.py            ← entry point
│   │   ├── api/v1/
│   │   │   ├── router.py      ← combine all routers
│   │   │   └── endpoints/
│   │   │       ├── auth.py
│   │   │       ├── shops.py
│   │   │       ├── menu.py
│   │   │       ├── orders.py
│   │   │       ├── riders.py
│   │   │       ├── payments.py
│   │   │       └── admin.py
│   │   ├── models/            ← SQLAlchemy ORM
│   │   │   ├── base.py
│   │   │   ├── user.py
│   │   │   ├── shop.py
│   │   │   ├── menu.py
│   │   │   ├── order.py
│   │   │   ├── rider.py
│   │   │   └── settlement.py
│   │   ├── schemas/           ← Pydantic v2
│   │   │   ├── auth.py
│   │   │   ├── shop.py
│   │   │   ├── menu.py
│   │   │   ├── order.py
│   │   │   ├── rider.py
│   │   │   └── common.py
│   │   ├── services/          ← business logic
│   │   │   ├── auth.py
│   │   │   ├── shop.py
│   │   │   ├── order.py
│   │   │   ├── dispatch.py    ← rider matching
│   │   │   ├── payment.py
│   │   │   └── settlement.py
│   │   └── core/
│   │       ├── config.py      ← settings from .env
│   │       ├── security.py    ← JWT encode/decode
│   │       ├── database.py    ← async engine + session
│   │       └── deps.py        ← FastAPI dependencies
│   ├── alembic/
│   │   ├── alembic.ini
│   │   ├── env.py
│   │   └── versions/
│   ├── requirements.txt
│   └── .env.example
└── docs/
    ├── database-schema.sql    ← full schema
    ├── api-spec.md            ← API endpoints spec
    └── features.md            ← feature requirements
```

## Coding Standards

### Frontend (TypeScript / Next.js)
- Use App Router (NOT Pages Router)
- Server Components by default, `"use client"` only when needed
- TypeScript strict mode — no `any` types
- Zod for runtime validation
- `next/image` for all images
- No localStorage for sensitive data — use httpOnly cookies
- No inline styles — Tailwind only
- PascalCase components, camelCase functions, kebab-case files
- Absolute imports with `@/` prefix
- API calls via TanStack Query hooks
- Forms via React Hook Form + Zod
- Zustand for global state, useState for local
- All Thai strings in constants — never hardcoded in JSX

### Backend (Python / FastAPI)
- async/await for all endpoints
- Pydantic v2 for request/response
- SQLAlchemy 2.0 style (mapped_column)
- Alembic for migrations — never raw SQL in prod
- Validate with Pydantic before DB ops
- UUIDs externally, internal IDs stay internal
- Never return raw ORM models — convert to schemas
- snake_case everywhere, PascalCase for classes
- Router → Service → Repository pattern
- JWT with role claim on every protected endpoint
- Thai error messages that explain how to fix
- structlog with JSON output

### Database
- UUIDs as primary keys
- created_at + updated_at on every table
- Soft delete (deleted_at) — never hard delete
- Indexes on FKs and queried columns
- JSONB for flexible attributes
- bcrypt for passwords
- See docs/database-schema.sql for full schema

### API Response Format
```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": { "page": 1, "total": 100 }
}
```

## Design System

### Colors
```
brand-primary:    #E85D2E  (warm orange)
brand-secondary:  #2D6A4F  (forest green)
surface-bg:       #FAFAF7
surface-card:     #FFFFFF
text-primary:     #1A1A17
text-secondary:   #6B6B66
border-default:   #E5E5E0
success:          #2D6A4F
warning:          #E89B3C
danger:           #C73E3A
info:             #3A6FC7
```

### Typography
- Primary: IBM Plex Sans Thai (Google Fonts)
- Fallback: Sarabun, Inter, system

### Touch Targets: min 44x44px
### Border Radius: 8px buttons, 12px cards, 16px modals
### Spacing: 4px grid

## Order Flow

```
PENDING_PAYMENT → PAID → PREPARING → READY_FOR_PICKUP
→ RIDER_ASSIGNED → PICKED_UP → DELIVERED
```

Cancel: Customer before PREPARING, Merchant at PAID (auto refund), Rider before PICKED_UP (re-dispatch)

## Environment Variables — see .env.example files in frontend/ and backend/

## Notes for Claude CLI
1. Reference CLAUDE.md for consistency
2. Stay within P0 scope — no P1/P2 features
3. All UI copy in Thai — no Lorem Ipsum
4. Database schema at docs/database-schema.sql
5. API spec at docs/api-spec.md
6. Every API response uses standard format
7. Every error message in Thai + actionable
