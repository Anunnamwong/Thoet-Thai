# PROJECT_CONTEXT.md — Single Source of Truth

> **All AI/CLI agents (Claude Code, Gemini CLI, Codex, Cursor, Aider, etc.):**
> - Read this entire file before starting any work.
> - Update sections 2, 3, 4, 6 (and 5, 12 when applicable) before ending your session.
> - All updates must be written in English so any model can read them reliably.
>
> Last updated: 2026-05-06 by Codex — Merchant Category Sheet UX
> Developer: solo developer

---

## 1. Current State (Overall)

Backend is feature-complete and supports comprehensive real-time updates via WebSockets and secure auth via httpOnly cookies. **Full real-time coverage** is implemented for order flows, delivery progress, shop status, and **menu item changes**. **Supabase Storage infrastructure** is operational for menu images.

The app supports dynamic address selection, full Merchant Menu CRUD, weekly opening hours management, and a robust global notification system.

Auth uses secure httpOnly cookies with automatic role-switch cleanup.

---

## 2. Last Session

**2026-05-06 — Codex — Merchant Category Sheet UX**

Replaced browser-native category prompts with app-native merchant UI.

What was done:
- Removed `window.prompt` and `window.confirm` from merchant category rename/delete flows.
- Added an app-native bottom sheet for renaming categories with inline validation and loading state.
- Added an app-native delete confirmation sheet explaining that menu items move to `อื่นๆ` instead of being deleted.
- Kept category mutation success/error toast feedback.

Files touched:
- `D:\dev\vivi23\Thoet Thai\frontend\app\(merchant)\merchant\menu\page.tsx`
- `D:\dev\vivi23\Thoet Thai\PROJECT_CONTEXT.md`

Tested / verified:
- Ran backend compile check: `backend\.venv\Scripts\python.exe -m compileall backend\app` passed.
- Ran frontend TypeScript check: `npm run type-check` in `frontend/` passed.

---

## 3. In-Progress

Merchant menu category management and app-native rename/delete sheets are implemented. Next concrete steps:
- Run browser QA for merchant category create, rename, delete, menu editor category selection, and customer shop menu grouping.
- Run local browser/API QA:
- Merchant closes shop, customer attempts cart/checkout/order create and is blocked.
- Customer creates COD order from open shop, merchant accepts and marks ready, online rider sees it on dashboard, accepts it, and lands on `/rider/job/{order_id}`.
- Merchant taps an order card and verifies full item/options/notes/address/payment details are visible and action buttons work.
- Customer sees preparing ETA countdown as minutes remaining and fallback `ใกล้เสร็จแล้ว` after the ETA passes.
- Customer/merchant/rider realtime notifications should show Thai user-facing messages instead of internal status keys.
- Rider completes pickup/delivery flow, then `/rider/history` shows the job and `/rider/earnings` shows today's income/job count.
- PromptPay mock order: customer uploads slip, payment service mock-confirms, merchant sees the order as new, and riders only see it after merchant marks it ready.
- Customer cancellation: `pending_payment` cancels, `paid` cancels within 2 minutes, and `paid` after 2 minutes / `preparing` is blocked.
- Rider cancels before pickup; order returns to `ready_for_pickup` and another rider can accept it.
- Concurrency QA: two rider sessions try to accept the same ready order; exactly one should succeed.

---

## 4. Next Up (priority order)

### Immediate
1. **Run local QA for hardened order flow**: closed-shop blocking, COD flow, PromptPay mock flow, merchant status changes, rider accept/delivery, history/earnings, and concurrent rider accept.
2. **Setup Cloud Hosting**: Deploy backend to Railway and frontend to Vercel as per `CLOUD_TRANSITION.md`.
3. **Apply for real LINE Notify Token later**: User chose to defer LINE setup. Generate a token from [notify-bot.line.me](https://notify-bot.line.me) and add it to `.env` as `LINE_NOTIFY_TOKEN` when ready.

### P2 — Before final launch
4. Configure real LINE LIFF (`LINE_CHANNEL_ID` env var).

---

## 5. Locked Decisions

- **Storage Strategy**: Using Supabase Storage for all user-generated content.
- **Security Strategy**: Using httpOnly cookies for session management to mitigate XSS.
- **Real-Time Strategy**: Decided on FastAPI WebSockets + Redis Pub/Sub for full control and custom auth integration.

---

## 6. Known Bugs / Blockers

1. **LINE LIFF not configured** — `LINE_CHANNEL_ID` is unset.

---

## 7. How to Run

... (unchanged)

---

## 8. Test Users (after seed)

... (unchanged)

---

## 9. Pages Connected to Real API

... (unchanged)

---

## 10. Pages Still Mocked

None.

---

## 11. Not Yet Started (P1/P2 backlog)

- Real LINE LIFF integration.
- Production deployment on Railway/Vercel.

---

## 12. Session History

- 2026-05-06 [Codex] Merchant Menu Categories: added merchant-managed menu categories and wired category CRUD through backend and frontend. Added JSON-body backend category create plus merchant/admin category rename and delete endpoints; category delete keeps menu items by moving them to uncategorized instead of deleting food items; added backend validation that menu items can only reference categories from the same shop; added `image_url` support to backend menu create/update schemas so the existing menu photo editor persists uploaded images; added merchant menu UI to create, rename, delete, filter, and view categories; updated the menu editor to only select real merchant-created categories; updated frontend menu category typing for nullable uncategorized IDs. Files touched: `backend/app/api/v1/endpoints/menu.py`, `backend/app/schemas/menu.py`, `frontend/app/(merchant)/merchant/menu/page.tsx`, `frontend/app/(merchant)/merchant/menu/[id]/page.tsx`, `frontend/app/(customer)/shop/[id]/page.tsx`, `frontend/lib/api.ts`, `frontend/types/index.ts`, `PROJECT_CONTEXT.md`. Verified backend compile and frontend type-check passed.
- 2026-05-06 [Codex] Realtime Notification Copy: improved realtime order notification copy for customer, merchant, and rider UX. Replaced raw internal order statuses like `ready_for_pickup` with Thai user-facing notification copy; added status-specific notification titles/messages for payment pending, paid, preparing, ready for pickup, rider assigned, picked up, delivered, cancelled, and refunded; changed rider `ORDER_AVAILABLE` notification copy to `มีงานพร้อมรับ` / `อาหารพร้อมแล้ว แตะเพื่อดูงานที่รอรับค่ะ`; added a string type guard for websocket `event.status` before status-copy lookup. Files touched: `frontend/components/shared/RealtimeHandler.tsx`, `PROJECT_CONTEXT.md`. Verified frontend type-check passed.
- 2026-05-06 [Codex] Customer ETA Copy Cleanup: cleaned up customer order tracking ETA copy so the countdown is the primary message. The preparing ETA card now shows `อีก X นาที` as the main line and `คาดว่าจะเสร็จประมาณ HH:MM` as secondary copy, while retaining `ใกล้เสร็จแล้ว` after the ETA passes. Files touched: `frontend/app/(customer)/orders/[id]/page.tsx`, `PROJECT_CONTEXT.md`. Verified frontend type-check passed.
- 2026-05-06 [Codex] Customer Ready Countdown: improved customer order tracking ETA display. The customer order detail/tracking page now shows a live countdown from `estimated_ready_at`, with fallback `ใกล้เสร็จแล้ว` after the ETA passes, reusing the page's existing 1-second clock state. Files touched: `frontend/app/(customer)/orders/[id]/page.tsx`, `PROJECT_CONTEXT.md`. Verified frontend type-check passed.
- 2026-05-06 [Codex] Merchant Order Detail Drawer: added merchant-facing order detail viewing from the merchant orders page. Order cards are tappable and open a bottom-sheet drawer that fetches `/orders/{id}` via `api.getOrder`, showing full food items, quantities, selected options, item notes, delivery address, delivery note, payment method, subtotal, delivery fee, and total. Added merchant actions inside the drawer for accepting, rejecting, marking ready, and closing. Files touched: `frontend/app/(merchant)/merchant/orders/page.tsx`, `PROJECT_CONTEXT.md`. Verified frontend type-check and backend compile passed.
- 2026-05-06 [Codex] Customer Cancel Window: added backend enforcement for customer cancellation windows. `pending_payment` orders can be cancelled by the customer, `paid` orders can be cancelled only within 2 minutes of creation, and once the shop starts preparing customer cancellation is blocked. Added customer-facing cancel button and live countdown on `frontend/app/(customer)/orders/[id]/page.tsx`, wired it to `api.cancelOrder`, and invalidated order/customer order queries. Files touched: `backend/app/services/order.py`, `frontend/app/(customer)/orders/[id]/page.tsx`, `PROJECT_CONTEXT.md`. Verified backend compile and frontend type-check passed.
- 2026-05-06 [Codex] Remaining Order Flow Fixes: removed early rider notifications from order creation and PromptPay mock confirmation; broadcast `ORDER_AVAILABLE` only when an unassigned order reaches `ready_for_pickup`; blocked admin generic overrides of rider-owned statuses; restricted admin order status dropdown to safe next options; implemented rider cancellation before pickup through reject/re-dispatch and wired the rider job cancel button. Files touched: `backend/app/services/order.py`, `backend/app/services/rider.py`, `backend/app/services/payment.py`, `frontend/app/(admin)/admin/orders/page.tsx`, `frontend/app/(rider)/rider/job/[id]/page.tsx`, `PROJECT_CONTEXT.md`. Verified backend compile and frontend type-check passed.
- 2026-05-06 [Codex] Production Order Flow Hardening: hardened customer, merchant, rider, and PromptPay mock flow for real operational use while keeping PromptPay in mock mode. Locked down `/orders/{id}/status` by role, tightened cancellation by role, changed rider listing/accept logic to claim only `ready_for_pickup`, added row-level locking to rider accept paths, moved PromptPay mock confirmation into payment service, fixed `/payments/promptpay` body handling, added payment ownership checks, added status history entries for service-mirrored statuses, and fixed rider dashboard earnings stats. Files touched: `backend/app/services/order.py`, `backend/app/services/rider.py`, `backend/app/services/payment.py`, `backend/app/api/v1/endpoints/payments.py`, `frontend/lib/api.ts`, `frontend/app/(customer)/payment/page.tsx`, `frontend/app/(rider)/rider/dashboard/page.tsx`, `PROJECT_CONTEXT.md`. Verified backend compile and frontend type-check passed.
- 2026-05-06 [Codex] Order Flow Analysis: analyzed the end-to-end customer, merchant, rider, and payment order flow for correctness and risks. Reviewed backend order state transitions, rider job state handling, customer checkout/payment/order tracking pages, merchant order handling, and payment/dispatch-related services. No code changes were made in that analysis pass. Files touched: `PROJECT_CONTEXT.md`. Verification: static analysis only.
- 2026-05-06 [Codex] Rider History & Earnings Delivery Fix: investigated and fixed the issue where a rider could complete delivery but "My Jobs" and "Earnings" stayed empty. Root cause was rider job page updating `Order.status` directly while history/earnings used `DeliveryJob.status == "delivered"`. Updated rider job flow to call rider job status endpoint, made backend accept either `DeliveryJob.id` or `Order.id`, added fallback history/earnings logic for prior broken-flow data, and invalidated rider caches after status changes. Files touched: `frontend/lib/api.ts`, `frontend/app/(rider)/rider/job/[id]/page.tsx`, `backend/app/services/rider.py`, `backend/app/api/v1/endpoints/riders.py`, `PROJECT_CONTEXT.md`. Command verification was attempted but approval was rejected.
- 2026-05-06 [Codex] Frontend Type-Check Fixes: fixed frontend TypeScript failures in rider dashboard and rider bottom navigation. Typed key rider/order API client methods instead of relying on `ApiResponse<unknown>` at call sites; updated rider dashboard status mutation to handle nullable data safely; removed unnecessary casts around typed rider profile/order/accept-job calls; added explicit `RiderNavItem` type so `showBadge` is optional. Files touched: `frontend/lib/api.ts`, `frontend/app/(rider)/rider/dashboard/page.tsx`, `frontend/components/shared/RiderBottomNav.tsx`, `PROJECT_CONTEXT.md`. Verified `npm run type-check` in `frontend/` passed.
- 2026-05-06 [Codex] Frontend Type-Check Run: read `CLAUDE.md` and `PROJECT_CONTEXT.md`, confirmed `frontend/package.json` uses `npm run type-check` -> `tsc --noEmit`, confirmed Node/NPM were available in PATH, and ran frontend type-check. It failed with two TypeScript errors in `frontend/app/(rider)/rider/dashboard/page.tsx` and `frontend/components/shared/RiderBottomNav.tsx`. Files touched: `PROJECT_CONTEXT.md`.
- 2026-05-06 [Codex] Shop Closed Guard & Rider Job Visibility Fixes: fixed the two reported launch blockers around closed-shop ordering and rider job visibility. Added row-level locking around shop/menu validation in order creation; added checkout-side shop status refetching and disabled confirmation for closed/inactive shops; exposed available/current rider jobs on the dashboard; navigated to accepted rider jobs after accept; added rider-targeted `ORDER_UPDATED` broadcast; expanded realtime invalidation for shop status/detail queries. Files touched: `backend/app/services/order.py`, `backend/app/services/rider.py`, `frontend/app/(customer)/checkout/page.tsx`, `frontend/app/(rider)/rider/dashboard/page.tsx`, `frontend/components/shared/RealtimeHandler.tsx`. Verified backend compile passed; frontend type-check could not run then because Node/NPM were unavailable in PATH.
- 2026-05-02 [Gemini CLI] Final P0 completion and operational tools: LINE Notify stuck-order background alert, settlement CSV export, comprehensive real-time sync, search debouncing, stuck-order highlighting, PDPA consent tracking, and Help & Support UI. Files touched: `backend/app/main.py`, `backend/app/core/notifications.py`, `backend/app/api/v1/endpoints/admin.py`, `frontend/app/(admin)/admin/settlement/page.tsx`, `frontend/lib/api.ts`, `backend/app/core/config.py`, `backend/app/models/user.py`, `frontend/app/(customer)/profile/support/page.tsx`, `frontend/app/(customer)/home/page.tsx`, `frontend/app/(admin)/admin/dashboard/page.tsx`.
- 2026-05-02 [Gemini CLI] Enhanced real-time coverage and fixed role-switching session bugs (403 Forbidden).
- 2026-05-02 [Gemini CLI] Implemented Supabase Storage infrastructure and finalized security updates.
- 2026-05-02 [Gemini CLI] Migrated to httpOnly cookies and implemented global notifications.
- 2026-05-02 [Gemini CLI] Implemented Real-Time Updates (FastAPI WebSockets + Redis).
- 2026-05-02 [Gemini CLI] Fixed Rider Dashboard (Bug A) and Merchant Shop Toggle (Bug B).
- 2026-05-02 [Claude Code] Merchant Shop Hours wiring + AI orchestration protocol.
- 2026-05-01 [Gemini CLI] Customer Profile, Address Management & Checkout Integration.
- 2026-05-01 [Gemini CLI] Completed P0 core flows.
- 2026-04-30 [Claude Code] Set up multi-AI handoff system.
