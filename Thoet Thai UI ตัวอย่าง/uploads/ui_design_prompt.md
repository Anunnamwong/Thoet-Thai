# UI Design Prompt — Hyperlocal Food Delivery App (Thoet Thai)

> **How to use:** Paste this prompt into Claude / v0.dev / Bolt.new / Lovable / Cursor.
> Replace `[APP_NAME]` with your final app name before submitting.

---

## 1. Project Context

Build a production-ready frontend for a hyperlocal food delivery app serving **Thoet Thai subdistrict (ตำบลเทอดไทย, อำเภอแม่ฟ้าหลวง, จังหวัดเชียงราย)** — a small mountain community with diverse ethnic groups (Thai, Shan, Akha, Lahu, Yunnanese).

**App name placeholder:** `[APP_NAME]` (TBD — design must accommodate a 1–2 syllable Thai brand name)

**Differentiators vs Grab/LineMan:**
- Lower commission (10–15% vs 30–35%)
- Cheaper delivery (zone-based, not distance-based)
- Community-focused, money stays local
- Cash on Delivery (COD) is first-class, not afterthought

---

## 2. Tech Stack (Required)

```
Frontend:    Next.js 14 (App Router) + TypeScript
Styling:     Tailwind CSS + shadcn/ui
State:       Zustand (global) + TanStack Query (server state)
Forms:       React Hook Form + Zod
Maps:        Longdo Map (cheaper than Google) or Mapbox
Auth:        LINE Login (LIFF SDK)
Backend:     FastAPI + PostgreSQL (Supabase) + Redis
Realtime:    Supabase Realtime
Deploy:      Vercel (frontend), Railway (backend)
Monitoring:  Sentry (error tracking)
```

---

## 3. User Roles (4 separate LIFF apps, shared codebase)

| Role | Platform | Primary Need |
|------|----------|--------------|
| Customer (ลูกค้า) | LINE LIFF | Browse, order, track |
| Merchant (ร้านค้า) | LINE LIFF | Receive orders, manage menu |
| Rider (ไรเดอร์) | LINE LIFF | Accept jobs, navigate, deliver |
| Admin | Web (responsive) | Monitor, settle, support |

**Architecture:** Monorepo with route groups — `app/(customer)`, `app/(merchant)`, `app/(rider)`, `app/(admin)`. Role detected from LIFF profile + JWT.

---

## 4. Design System

### Aesthetic
- **Style:** Clean, modern, minimal — Anthropic/Linear-inspired
- **Mood:** Friendly, trustworthy, locally rooted (not corporate)
- **Density:** Comfortable — readers may include 50+ year-old shop owners
- **No:** Gradients, drop shadows, neon glows, dark mode (Phase 2)

### Typography
- **Primary font:** `IBM Plex Sans Thai` (Google Fonts) — handles Thai + Latin equally well
- **Fallback:** `Sarabun` for Thai, `Inter` for Latin
- **Scale:** 12 / 14 / 16 / 18 / 22 / 28 px
- **Weights:** 400 regular, 500 medium, 600 semibold (no 700/800)

### Color Tokens
```css
--brand-primary:    #E85D2E  /* warm orange — appetite, energy */
--brand-secondary:  #2D6A4F  /* forest green — trust, local */
--surface-bg:       #FAFAF7
--surface-card:     #FFFFFF
--text-primary:     #1A1A17
--text-secondary:   #6B6B66
--border-default:   #E5E5E0
--success:          #2D6A4F
--warning:          #E89B3C
--danger:           #C73E3A
--info:             #3A6FC7
```

### Layout
- **Mobile-first** — design for 375px width primarily, scale up
- **Touch targets:** minimum 44×44px
- **Border radius:** 8px (buttons, inputs), 12px (cards), 16px (modals)
- **Spacing unit:** 4px grid (4/8/12/16/24/32/48)

---

## 5. Required Screens

### 5.1 Customer App
- [ ] Splash / loading screen
- [ ] Onboarding (3 slides, skippable, first launch only)
- [ ] LINE login + phone verification
- [ ] Address setup (map pin + manual address fields)
- [ ] Home (shop list, search, filter by category)
- [ ] Shop detail (info, hours, menu by category)
- [ ] Menu item detail (options, quantity, special note)
- [ ] Cart (review, edit quantities, apply promo)
- [ ] Checkout (delivery address, payment method, total breakdown)
- [ ] PromptPay QR payment screen
- [ ] Order tracking (real-time status, rider map, ETA, chat button)
- [ ] Order history (list + detail)
- [ ] Reorder flow
- [ ] Profile / settings
- [ ] Notifications inbox

### 5.2 Merchant App
- [ ] Login (phone OTP or LINE)
- [ ] Today's dashboard (orders, revenue, status toggle)
- [ ] Incoming order alert (full screen, sound, vibrate)
- [ ] Order detail + accept/reject + cooking time selector
- [ ] Active orders list (preparing → ready → picked up)
- [ ] Menu management (list, add, edit, sold-out toggle)
- [ ] Menu item editor (photo, name, price, options, description)
- [ ] Shop hours editor (per-day open/close, holidays)
- [ ] Revenue dashboard (today / week / month)
- [ ] Settlement history + invoice download
- [ ] Profile / shop info / bank account

### 5.3 Rider App
- [ ] Login (phone OTP or LINE)
- [ ] Online/offline toggle (large, prominent)
- [ ] Available job notification (full screen, 30s timeout)
- [ ] Active job (pickup → delivery flow with status buttons)
- [ ] Map navigation deep-link
- [ ] Proof of delivery (photo upload)
- [ ] Earnings dashboard (today / week / month)
- [ ] Job history
- [ ] Profile / vehicle info / bank account

### 5.4 Admin Web
- [ ] Login (email + password + 2FA)
- [ ] Live order monitor (filterable, alert on stuck orders)
- [ ] Order detail with manual override (reassign rider, refund, cancel)
- [ ] Merchant approval queue + KYC review
- [ ] Rider approval queue + KYC review
- [ ] User management (search, suspend, view history)
- [ ] Settlement queue (pending payouts to merchants/riders)
- [ ] Promotion management (create coupon, set rules, view usage)
- [ ] Support ticket inbox

---

## 6. **Production-Ready Pages (Critical — Often Missed)**

These are NON-NEGOTIABLE for launch:

### 6.1 Legal (Required by Thai Law — PDPA 2019)
- [ ] **Terms of Service** (ข้อกำหนดและเงื่อนไขการใช้บริการ) — Thai + English toggle
- [ ] **Privacy Policy** (นโยบายความเป็นส่วนตัว) — PDPA compliant, lists data collected, purpose, retention, rights
- [ ] **Cookie Policy** with banner on first visit (accept all / essential only / customize)
- [ ] **Refund & Cancellation Policy** (นโยบายการคืนเงินและยกเลิก)
- [ ] **PDPA Consent Form** at signup (separate consent for: service, marketing, third-party sharing)
- [ ] **Data Subject Rights page** — request data export, request deletion (in profile settings)

### 6.2 Support
- [ ] **FAQ** (คำถามที่พบบ่อย) — searchable, categorized by role
- [ ] **Contact Us** (ติดต่อเรา) — LINE OA link, phone, email, address
- [ ] **Help Center** (ศูนย์ช่วยเหลือ) — articles per common issue
- [ ] **Report a Problem** flow (in-app, attaches order ID + screenshot)

### 6.3 Error & Edge States
- [ ] **404 Not Found** page (with friendly Thai copy + back to home)
- [ ] **500 Server Error** page (with retry + contact support)
- [ ] **Offline state** (when LIFF loses connection — show cached cart)
- [ ] **Maintenance mode** banner (admin can toggle)
- [ ] **Geo-restriction** page (when user is outside Thoet Thai zone — explain + waitlist)
- [ ] **App version outdated** screen (force update prompt)

### 6.4 Empty States (every list view needs one)
- [ ] No shops nearby
- [ ] Empty cart
- [ ] No order history
- [ ] No active jobs (rider)
- [ ] No incoming orders (merchant)
- [ ] No search results
- [ ] No notifications

### 6.5 Loading States
- [ ] Skeleton screens for: shop list, menu, order list, dashboard
- [ ] Spinner for: button actions, form submissions
- [ ] Progress bar for: file uploads (menu photos, KYC docs)

### 6.6 Confirmation Modals (irreversible actions)
- [ ] Cancel order
- [ ] Delete menu item
- [ ] Reject incoming order (merchant)
- [ ] Reject job (rider, after accepting)
- [ ] Sign out
- [ ] Delete account

### 6.7 Onboarding & First-Use
- [ ] Welcome modal explaining LINE login
- [ ] Tooltip tour for first order (customer)
- [ ] Tooltip tour for first menu setup (merchant)
- [ ] Tooltip tour for first job (rider)
- [ ] Empty state CTAs that teach (e.g., "Add your first menu item →")

---

## 7. Component Library (shadcn/ui base + custom)

**From shadcn/ui:** Button, Input, Select, Checkbox, RadioGroup, Switch, Dialog, Sheet, Toast, Skeleton, Card, Badge, Tabs, Accordion, Popover, Tooltip, AlertDialog

**Custom (build these):**
- `<OrderStatusBadge />` — pill with color per status
- `<PriceTag />` — formatted ฿X,XXX with optional strikethrough
- `<MenuItemCard />` — image + name + price + add button
- `<ShopCard />` — cover image + name + cuisine tags + open/closed
- `<RiderTracker />` — map with rider pin + ETA
- `<OrderTimeline />` — vertical stepper with timestamps
- `<EmptyState />` — illustration + heading + body + CTA
- `<ErrorBoundary />` — wrapper with fallback UI
- `<PDPAConsentCheckbox />` — required checkbox with link to policy
- `<ThaiAddressForm />` — subdistrict / district / province dropdowns with proper data
- `<ThaiPhoneInput />` — 10-digit format with auto-mask (0XX-XXX-XXXX)

---

## 8. Thai Localization Requirements

- **Default language:** Thai (ภาษาไทย)
- **Currency:** ฿ symbol, format `฿1,250` or `1,250 ฿`
- **Phone format:** `0XX-XXX-XXXX` (10 digits, starts with 0)
- **Address:** บ้านเลขที่ → หมู่ → ซอย → ถนน → ตำบล → อำเภอ → จังหวัด → รหัสไปรษณีย์
- **Date format:** `DD/MM/YYYY` or `DD MMM YYYY` (Buddhist Era optional, default Christian)
- **Time format:** 24-hour (`14:30 น.`)
- **Number formatting:** Thai locale (`Intl.NumberFormat('th-TH')`)
- **Distance:** kilometers / meters
- **Polite particles:** Use ครับ/ค่ะ in error messages and CTAs where natural

---

## 9. Accessibility (WCAG 2.1 AA minimum)

- Color contrast ≥ 4.5:1 for body text, 3:1 for large text
- All interactive elements have visible focus states
- All icons have `aria-label`
- All form fields have labels (not just placeholders)
- Touch targets ≥ 44×44px
- Support OS-level font scaling up to 200%
- Test with TalkBack (Android) and VoiceOver (iOS)

---

## 10. Performance Budget

- Lighthouse mobile score ≥ 90
- LCP < 2.5s on 3G
- Initial JS bundle < 200KB gzipped per route
- Images: `next/image` only, AVIF/WebP, lazy load below fold
- Fonts: subset to Thai + Latin, `font-display: swap`
- No client-side rendering for content pages (Terms, Privacy, FAQ)

---

## 11. Security Requirements

- All forms have CSRF protection
- Input sanitization (Zod validation everywhere)
- File uploads: validate MIME type + size + virus scan (ClamAV later)
- Rate limiting on login (5 attempts / 15 min)
- HTTPS only, HSTS enabled
- CSP headers configured
- No sensitive data in URLs or localStorage (use httpOnly cookies)

---

## 12. Real Content (No Lorem Ipsum)

All copy must be in **real Thai**, written for the actual audience:
- Friendly but not childish
- Use ครับ/ค่ะ sparingly (only in CTAs and errors)
- Avoid English jargon (use เมนู not "menu", ตะกร้า not "cart")
- Error messages explain what went wrong AND how to fix it
- Empty states are encouraging, not blank

**Example error copy (good):**
> "ตอนนี้ร้านปิดอยู่ครับ เปิดอีกครั้ง 17:00 — ลองดูร้านอื่นที่เปิดตอนนี้มั้ย?"

**Example error copy (bad):**
> "Error: Shop is closed."

---

## 13. Deliverables

1. **Wireframes** — low-fidelity for all screens listed in section 5 + 6
2. **High-fidelity mockups** — Figma file with components + variants
3. **Interactive prototype** — clickable Figma or live Next.js app
4. **Component library** — Storybook with all custom components
5. **Design tokens** — exported as CSS variables + Tailwind config
6. **Copy deck** — all Thai strings in JSON for i18n
7. **Production checklist** — verifying every item in section 6 is implemented

---

## 14. Out of Scope (Phase 2+)

- Native iOS/Android apps
- Dark mode
- Multi-language beyond Thai/English
- Voice ordering
- AR menu preview
- Group ordering
- Subscription/membership
- Loyalty points

---

## 15. First Milestone (3 weeks)

Ship these in order:
1. **Week 1:** Design system + tokens + core components + customer home + shop detail
2. **Week 2:** Customer cart + checkout + payment + order tracking
3. **Week 3:** All production-ready pages (section 6) + error states + empty states

Goal: Customer can place a real order end-to-end, AND every page a regulator or user might check exists.

---

**Output format expected:**
Generate Next.js 14 App Router code, TypeScript, with shadcn/ui components. Include all Thai copy inline (not placeholders). Include responsive breakpoints. Mobile-first. No partial implementations — every screen complete.
