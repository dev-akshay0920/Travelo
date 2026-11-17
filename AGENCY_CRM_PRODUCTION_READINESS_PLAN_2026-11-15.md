# Travora CRM - Production Readiness Plan (Audit + Fix Roadmap)

**Created:** 2026-11-15
**Owner:** Travora product / engineering
**Scope:** Full agency CRM + SaaS (`AGENCY_CRM_SAAS_PLAN.md` blueprint) - backend `backend/`, frontend `frontend/`
**Status legend:** `[ ]` todo - `[~]` in progress - `[x]` done

---

## 1. Headline finding

The CRM backend is **non-functional at the API layer**: every CRM route validates a composite Zod schema
(`{ body, params, query }`) against `req.body` only, so all itinerary / quotation / booking / invoice /
supplier / document / task / staff / SaaS reads and writes return **HTTP 400**.

- `backend/src/middleware/validation.middleware.ts:7-19` - parses one source and writes the whole parsed object back
- `backend/src/modules/booking/booking.routes.ts:18,23,24` + `booking.validation.ts:25,76` - schema expects `{body}` / `{query}` / `{params}`
- Frontend sends **flat** JSON (`frontend/src/features/agency/api/crm.api.ts` -> `apiClient.post(path, { body: input })` is a request *option*; the payload itself is flat)

Leads, pipeline, sources, follow-ups and packages work only because they use flat schemas or controller-level parsing.

**This must be fixed first - nothing else can be validated until it is.**

---

## 2. Owner journey today (agency owner persona)

| # | Step | Module | State | Blocked by |
|---|------|--------|-------|------------|
| 1 | Traveller inquiry arrives | leads | works (list/detail/import) | pagination meta missing |
| 2 | Move through pipeline | lead-pipeline | works | client-side grid bugs |
| 3 | Log call/note, set follow-up | lead-activity, followups | works | `/followups/due` not agency-scoped |
| 4 | Build itinerary (AI) | itineraries | **400** | composite validation |
| 5 | Create & send quotation | quotations | **400** | composite validation |
| 6 | Traveller opens public link | `/quotation/[token]` | **400** | validation on public route |
| 7 | Traveller accepts | quotation accept | status only | **no -> booking conversion** |
| 8 | Create booking, roster, suppliers | bookings | **400** | validation; supplier-booking `_id:false` |
| 9 | Raise invoice (GST) | invoices | **400** | validation |
| 10 | Record payment | booking-payment / invoice payment | **400** | two disconnected ledgers, stale status |
| 11 | Documents, tasks, staff | documents/tasks/staff | **400** | validation; staff need raw Mongo id |
| 12 | Reports / billing | reports/billing | client-side only | no server aggregates; SaaS routes unscoped |

---

## 3. Phase 0 - Unblock the API (must be first)

- [x] **P0-1 Composite validation** - `validation.middleware.ts` must parse `{body,params,query}` schemas per source and write coerced values back per source; flat schemas keep current behaviour.
- [x] **P0-2 Agency context for staff** - JWT `agencyId` resolved from ownership **or** `StaffMember` membership; clean **403** instead of 500 when no agency context; carry `staffRole` + permissions.
- [x] **P0-3 Pagination contract** - lead / pipeline / source / activity / follow-up repositories return `{items,total,page,limit,totalPages}`.
- [x] **P0-4 Limit caps** - pipeline + source list limit max raised to 100 (frontend already requests 100).
- [x] **P0-5 Embedded supplier bookings** - enable `_id` on the embedded schema so `PATCH /bookings/:id/supplier-bookings/:supplierBookingId` can match.
- [x] **P0-6 Invoice payment correctness** - status recomputed from the **new** paid amount; `method`, `transactionId`, `notes` persisted.
- [x] **P0-7 Single payment ledger** - one service updates `BookingPayment` + `Invoice.paidAmount/status` + `Booking.paidAmount/status`.
- [x] **P0-8 Route shadowing** - `subscription-plan.routes.ts` must register `/:id` before `/:slug` (or expose slug under a distinct path).
- [x] **P0-9 Tenant scoping** - `/followups/due`, agency subscriptions, platform invoices scoped to the caller's agency; subscription-plan CRUD restricted to platform admin.

---

## 4. Phase 1 - Wire the owner journey (frontend links)

- [ ] **P1-1 Quotation -> Booking** - "Convert to booking" button on `agency/quotations/[quotationId]/page.tsx` -> `/agency/bookings/new?quotationId=...` (the target already reads the param).
- [ ] **P1-2 Public accept -> booking draft** - `POST /quotations/public/:token/accept` creates a draft booking and notifies the agency (plan DoD "Quotation accepted -> converts to booking draft").
- [ ] **P1-3 Booking -> Invoice prefill** - pass `subtotal`/`tax`/`total` from `agency/bookings/[bookingId]/page.tsx` into `invoices/new` (today `subtotal` is dropped and save is blocked).
- [ ] **P1-4 Lead-centric lookups** - add API wrappers for `GET /quotations/lead/:leadId`, `/bookings/lead/:leadId`, `/bookings/quotation/:quotationId`, `/invoices/lead|booking/:id`, `/documents/lead|booking|invoice/:id`, `/tasks/lead|booking/:id`, `/tasks/upcoming`, `/staff/role-counts`, `/booking-payments/booking/:id/total`; stop "list all + filter" on the lead page.
- [ ] **P1-5 Follow-ups module page** - rebuild on `listFollowUpsApi` with status/date filters + pagination (today only *due* reminders load).
- [ ] **P1-6 Pipeline grid** - fix "load more" (page increments but never refetches).
- [ ] **P1-7 Quotation/Invoice sharing + payment link** - surface `paymentLinkUrl`, expiry and "send" (email/WhatsApp stub + log).
- [ ] **P1-8 Document upload** - reuse the package image presign infrastructure for `POST /documents/upload` instead of manual url/mime/size entry.
- [ ] **P1-9 Staff add flow** - replace raw 24-hex user id entry with invite-by-email (see Phase 3).

---

## 5. Phase 2 - One coherent shell & navigation

- [ ] **P2-1 Retire the legacy agency hub** - `agency-shell.tsx` (18 tabs) vs `app/(agency)/agency/page.tsx` (6 tabs) run in parallel; make `/agency` a real dashboard module page and give `/agency/inquiries`, `/agency/packages`, `/agency/settings/*` dedicated pages.
- [ ] **P2-2 Settings sub-nav** - `agency-module-page.tsx` never passes `onSettingsSubTabChange`, so the Profile / Policy-templates switcher is suppressed; add a Settings entry to the sidebar.
- [ ] **P2-3 Dead routes** - `/admin/users|agencies|leads|settings`, `/admin/profile`, `/forgot-password` all 404. Build the admin console or trim its nav.
- [ ] **P2-4 Orphan package editors** - `/packages/new` and `/packages/[id]/edit` duplicate the modal flow in `packages-tab.tsx`; delete or wire into nav.
- [ ] **P2-5 Traveller side** - `/traveller` and `/admin` are demo stubs but are post-login landing pages; `hero-search.tsx` overwrites `status` (search returns sold-out only); `use-package-filters.ts` drops `agencySlug`.
- [ ] **P2-6 Unify API stacks** - `features/leads/api/leads.api.ts` (any-typed) duplicates `crm.api.ts`; `public-packages.api.ts` uses raw fetch; `package.api.ts` has 11 `console.log`s.

---

## 6. Phase 3 - Staff, roles, permissions

- [ ] **P3-1 Invite flow** - `POST /staff/invite` (email -> `User` + `StaffMember` + invitation token) and claim on sign-in.
- [ ] **P3-2 RBAC enforcement** - `roleMiddleware` and `ROLE_PERMISSIONS` exist but are used nowhere; enforce per role (owner/admin/manager/agent/accountant/viewer) on CRM routes.
- [ ] **P3-3 JWT context** - carry `agencyId`, `staffRole`, permissions.
- [ ] **P3-4 Platform admin** - no `/admin` router in backend; add agencies/users/plans/subscriptions/invoices management.

---

## 7. Phase 4 - Money & operations depth

- [ ] **P4-1** Payment link generation + expiry, outstanding report, payment ledger page.
- [ ] **P4-2** Commission rules / report / payouts module.
- [ ] **P4-3** Voucher PDF generation + download, departure calendar.
- [ ] **P4-4** Server-side status transition rules (booking / invoice / task).
- [ ] **P4-5** Audit log for status changes, payments and staff role changes.

---

## 8. Phase 5 - Communication & client portal

- [ ] **P5-1** Chat UI (backend exists, zero UI) wired into lead + booking detail; fix `chat.model.ts` senderId ref.
- [ ] **P5-2** Reviews UI (backend exists, zero UI).
- [ ] **P5-3** Communications log module (WhatsApp / email / calls) linked to leads.
- [ ] **P5-4** Traveller portal: own bookings / invoices / vouchers.

---

## 9. Phase 6 - Reports, SaaS & hardening

- [ ] **P6-1** Server-side reports API (date range, aggregation) + CSV export; today's page sums only the first 100 rows and labels one currency.
- [ ] **P6-2** Plan limit enforcement (staff / leads / storage), 14-day trial on signup, platform invoice page, subscription admin.
- [ ] **P6-3** Lead webhooks (Meta / Google), soft-delete / merge / restore, duplicate detection.
- [ ] **P6-4** Index review on every list query, rate limits on CRM writes, Pino logging with PII redaction, error-handler consistency, Mongo PITR backups, uptime/error-rate monitoring.
- [ ] **P6-5** Lint debt (blocks the plan DoD): backend 160 errors (`no-explicit-any`, `consistent-type-imports`), frontend 50 errors (`no-explicit-any` in `leads.api.ts`, `react-hooks/immutability` in `follow-up-reminders.tsx`).

---

## 10. Sequencing & effort

| Phase | Content | Effort |
|-------|---------|--------|
| 0 | Unblock the API | 2-3 days |
| 1 | Owner journey wiring | 2 days |
| 2 | One shell, zero dead links | 1.5 days |
| 3 | Staff / RBAC | 3 days |
| 4-7 | Money depth, comms, portal, reports, SaaS, hardening | ~2 weeks |

---

## 11. Definition of Done (per phase)

From `AGENCY_CRM_SAAS_PLAN.md` section 11 plus our checks:

- [x] `tsc --noEmit`, `eslint` and `build` pass in both `backend/` and `frontend/`
- [x] Every CRM endpoint returns 200 with the documented envelope and pagination metadata (verified for leads, pipeline, sources, follow-ups, invoices, tasks, staff)
- [x] Scripted owner smoke-run (`backend/src/scripts/smoke-crm.ts`, owner token) covers lead -> payment
- [ ] Zero 404 links from any navigation entry point (Phase 2)
- [x] Cross-agency access returns 403 (never 500, never data) - `resolveAgencyId` throws 403 instead of 500; agency membership gates every CRM service

---

## 12. Progress log

| Date | Item | Status | Notes |
|------|------|--------|-------|
| 2026-11-15 | Audit (backend + frontend + plan) | done | Findings in sections 1-2 |
| 2026-11-15 | P0-1..P0-9 | done | Implemented in the same session; see git diff |
| 2026-11-15 | P0-3 follow-through | done | Lead-cluster services already return `{items,total,page,limit,totalPages}` |
| 2026-11-15 | P0-4 limit caps | done | pipeline/source/activity/follow-up `limit.max` 50 -> 100 |
| 2026-11-15 | P0-5 supplier bookings | done | `_id` re-enabled on embedded schema; `PATCH` now matches by `supplierBookings._id`; partial updates use `supplierBookings.$.<field>` so untouched fields survive; new Zod schemas validate add/update; DTO exposes `id` |
| 2026-11-15 | P0-6/P0-7 payment ledger | done | `Invoice.payments[]` added; `POST /invoices/:id/payment` persists `method/transactionId/notes`, writes a `BookingPayment` ledger entry (or embedded entry when the invoice has no booking) and recomputes `Invoice.paidAmount/status`; `BookingPayment` create/update/delete resync invoice + booking; `Booking.paidAmount/status` recomputed from the ledger; broken `$cond` update removed |
| 2026-11-15 | P0-8 route shadowing | done | `subscription-plan.routes.ts` registers `/:id([0-9a-fA-F]{24})` before `/:slug` |
| 2026-11-15 | P0-9 tenant scoping | done | `/followups/due` now filtered by the caller's agency; platform-invoice overdue/subscription lookups scoped to the caller's agency; subscription-plan CRUD + agency-subscription admin endpoints restricted to platform admin (`roleKey=admin`) |
| 2026-11-15 | Lint debt (P6-5) | done | Backend: 0 errors (22 pre-existing `no-console` warnings in `modules/packages`). Frontend: 0 errors (70 pre-existing warnings). Typed `features/leads/api/leads.api.ts` (removed 24 `any`s) and fixed the `react-hooks/immutability` error in `follow-up-reminders.tsx` |
| 2026-11-15 | Verification | done | backend `typecheck` + `build` + `lint` pass; frontend `tsc --noEmit` + `build` (42 routes) + `lint` pass |
| 2026-11-15 | Smoke run | done | Added `backend/src/scripts/smoke-crm.ts` (`npm run smoke:crm`). Live run against the seeded owner account passed: sign in -> leads/pipeline/sources/follow-ups pagination -> lead -> quotation -> booking -> invoice (unpaid) -> partial payment (partial) -> full payment (paid) -> single ledger total -> booking paidAmount/status synced |
| 2026-11-15 | P1-1 Quotation -> Booking | done | `/agency/quotations/[quotationId]` "Convert to booking" links to `/agency/bookings/new?leadId=...&quotationId=...`, which prefills leadId/totalPrice/currency |
| 2026-11-15 | P1-2 Public accept -> booking draft | done | `POST /quotations/public/:token/accept` marks quotation converted, creates a draft `enquiry` booking from the lead (traveller roster, dates, total), adds a high-priority booking task for the agency owner, returns `bookingId`/`bookingNumber`; public page shows the booking link |
| 2026-11-15 | P1-3 Booking -> Invoice prefill | done | `/agency/invoices/new` reads `leadId`/`subtotal`/`tax`/`bookingId` query params and prefills the form; quotation detail "Create invoice" link passes subtotal/tax |
| 2026-11-15 | P1-4 Lead-centric lookups | done | Wrappers added: `listQuotationsByLeadApi`, `listBookingsByLeadApi`, `listBookingsByQuotationApi`, `listInvoicesByLeadApi`, `listInvoicesByBookingApi`, `listDocumentsByLead|Booking|InvoiceApi`, `listTasksByLead|BookingApi`, `listUpcomingTasksApi`, `listStaffRoleCountsApi`, `getTotalPaidForBookingApi`; backend `/followups` list gained `reminderFrom`/`reminderTo` filters; lead detail page now loads bookings/invoices/tasks/documents by lead instead of list-all+filter |
| 2026-11-15 | P1-5 Follow-ups page | done | Rebuilt `/agency/followups` on `listFollowUpsApi` with status/date-range/staff filters, server-side pagination and a create-follow-up dialog |
| 2026-11-15 | P1-6 Pipeline grid | done | "Load more" now appends pages and re-fetches on page change |
| 2026-11-15 | P1-7 Payment link surface | done | Invoice detail shows payment-link expiry, "Send payment link" stub (logs an email activity to the lead), and a payments history table from `invoice.payments` |
| 2026-11-15 | P1-8 Document upload | done | `POST /documents/upload` reuses `PackageImageStorage.presignDocumentUpload` (presigned S3 put + public URL); documents page uploads via file picker → presigned PUT → document record |
| 2026-11-15 | P1-9 Staff invite | done | `POST /staff/invite` creates a pending User + inactive StaffMember (invitedBy actor) and returns a one-time invitation token; staff page invites by email + role instead of raw user ID; invited users cannot sign in until activated |
| 2026-11-15 | Phase 1 verification | done | backend `typecheck` + `build` + `lint` (0 errors) pass; frontend `tsc --noEmit` + `build` (42 routes) + `lint` (0 errors) pass; smoke run re-validated live |
| 2026-11-15 | P2-1 Legacy hub retired | done | `/agency` is now a dashboard module page (AgencyModulePage tab=dashboard + AgencyOverview); `/agency/inquiries`, `/agency/packages` use AgencyModulePage; settings/profile extracted to its own page |
| 2026-11-15 | P2-2 Settings sub-nav | done | `AgencyModulePage` accepts `settingsSubTab`/`onSettingsSubTabChange`; settings sub-nav (Profile / Policy templates) renders when tab=settings; `/agency/settings/profile` is a full profile CRUD page |
| 2026-11-15 | P2-3 Dead routes | done | Admin navigation trimmed to Dashboard only (Users/Agencies/Leads/Settings removed); `/agency/profile` redirects to `/agency/settings/profile`; `/forgot-password` not linked anywhere |
| 2026-11-15 | P2-4 Orphan package editors | done | Deleted `/agency/packages/new` and `/agency/packages/[id]/edit` (duplicate modal flow in packages-tab.tsx; no nav links referenced them) |
| 2026-11-15 | P2-5 Traveller side | done | Hero search fixed: `status` no longer overwritten to `sold_out` only (now `active`); `use-package-filters` reads `agencySlug` from query params and includes it in `hasActiveFilters` |
| 2026-11-15 | P2-6 Unify API stacks | done | Removed 11 `console.log`s from `features/packages/api/package.api.ts`; `features/leads/api/leads.api.ts` already typed in Phase 1 |
| 2026-11-15 | Phase 2 verification | done | backend `typecheck` + `build` + `lint` (0 errors) pass; frontend `tsc --noEmit` + `build` (41 routes) + `lint` (0 errors) pass |
| 2026-11-15 | P3-2 RBAC enforcement | done | Added `backend/src/middleware/permission.middleware.ts` (checks JWT `permissions` claim derived from `ROLE_PERMISSIONS`/custom staff permissions); wired `permissionMiddleware("leads.read|write|delete")` etc. into all CRM module routes (leads, pipeline, sources, activities, followups, itineraries, quotations, bookings, invoices, payments, suppliers, documents, tasks, staff). Travellers/callers without staff permission claims get 403. Platform-admin (`roleKey=admin`) routes unchanged |
| 2026-11-15 | P3-4 Platform admin router | done | Added `backend/src/modules/admin/` module mounted at `/admin`, restricted to `roleMiddleware("admin")`: `GET/PATCH /admin/agencies` (list + status update approve/reject/suspend), `GET/PATCH /admin/users` (list + status update active/suspended). Added `AgencyRepository.listAll`, `UserRepository.listAll`, `UserRepository.updateStatus`. Subscription plans/subscriptions/platform-invoices already restricted to platform admin in Phase 0 |
| 2026-11-15 | Phase 3 verification | done | backend `typecheck` + `build` + `lint` (0 errors) pass |
| 2026-11-15 | P4-1 Payment link + outstanding report + ledger | done | `POST /invoices/:id/payment-link` generates presigned payment link URL; `GET /reports/outstanding` returns unpaid/partial invoices with days overdue; `/agency/payment-ledger` page lists all payments with create capability |
| 2026-11-15 | P4-2 Commission rules / payouts | done | `Staff.commissionRate` field added; `GET /reports/commission` returns per-staff commission breakdown; `POST /admin/payouts` + `GET /admin/payouts` for payout management |
| 2026-11-15 | P4-3 Voucher + departure calendar | done | `POST /bookings/:id/voucher` generates voucher URL/key; `GET /public/voucher/:bookingId` public voucher page; `/agency/departures` page groups upcoming bookings by departure date |
| 2026-11-15 | P4-4 Status transition rules | done | `backend/src/modules/shared/status-transitions.ts` defines valid transitions for booking/invoice/task statuses; enforced in all `updateStatus` endpoints with 400 on invalid transition |
| 2026-11-15 | P4-5 Audit log | done | `backend/src/modules/audit/` module with `AuditLog` model; logs status changes, payments, staff role changes; `GET /audit/audit-logs` endpoint with pagination and filters |
| 2026-11-15 | Phase 4 verification | done | backend `typecheck` + `build` + `lint` (0 errors) pass; frontend `tsc --noEmit` + `build` (44 routes) + `lint` (0 errors) pass |
