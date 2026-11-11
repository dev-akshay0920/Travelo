# Travora Agency Owner MVP — Implementation Plan

## Purpose

Give an agency owner a secure, useful way to establish a publishable presence on
Travora, manage travel packages, receive traveler inquiries, and follow up on
those inquiries. This plan is for the current **lead-generation marketplace**,
not a full booking-management or payment platform.

The central owner workflow is:

> Complete agency profile → get approved → publish packages → receive inquiries
> → contact travelers → record the outcome.

## Implementation authorization

The project owner explicitly authorized implementation of this MVP. The lead
security section in
[`backend/TRAVORA_BACKEND_RULES.md`](./backend/TRAVORA_BACKEND_RULES.md)
has been updated to reflect that approval and the required security controls.
The inquiry workflow must remain independent of chat until chat ownership has
been reviewed.

## What exists today

- The agency shell has Dashboard, Packages, and Settings in
  [`agency-shell.tsx`](./frontend/src/features/agency/components/agency-shell.tsx).
- The agency dashboard currently shows a small profile summary; profile
  creation, draft editing, submission, and approval status handling live in
  [`agency/page.tsx`](<./frontend/src/app/(agency)/agency/page.tsx>).
- Owners can create and manage packages through
  [`packages-tab.tsx`](./frontend/src/features/agency/components/packages-tab.tsx).
  Packages already have visibility, status, dates, price, capacity, and optional
  view/inquiry/booking metadata in
  [`package.types.ts`](./frontend/src/features/packages/types/package.types.ts).
- The backend has agency and package modules, plus an authenticated chat module.
  There is no Leads module or agency inquiry inbox yet.
- **Do not attach Leads to chat without a security and ownership review.**
  Existing chat code compares an agency ID with a user ID in participant checks
  and uses a user ID as an agency filter. For example, see
  [`chat.service.ts`](./backend/src/modules/chat/chat.service.ts). Correct and
  verify agency-owner authorization before reusing that module for agency
  workflows.
- The frontend and backend rules both prohibit writing tests. Implementation
  should honor those rules and use the repository-approved validation and
  release process.

## MVP outcome and scope

### In scope

1. **Agency overview** with clear status, next steps, package counts, and
   actionable inquiry counts.
2. **Profile readiness and publication clarity**: completion checklist,
   approval state and explanation, public profile preview, and a route to edit.
3. **Inquiry inbox** scoped to the owning agency, with detail, basic filters,
   status updates, internal notes, and pagination.
4. **Traveler inquiry submission** tied to an approved agency and, where
   applicable, a specific public package.
5. **Basic operational feedback** based on real data: active/public packages
   and inquiry counts by state.
6. **Responsive, accessible agency navigation** that places the high-frequency
   jobs first and uses the existing Travora design system.

### Explicitly out of scope for this MVP

- Booking confirmation, reservations, payment collection, refunds, or
  availability guarantees.
- Inventory synchronization, OTA/channel integrations, automated pricing,
  coupons, and a booking calendar.
- Automated email campaigns or a general notification platform. The backend
  rules currently defer email; do not introduce a mail provider as a side
  effect of this work.
- Advanced analytics, conversion attribution, or a charting subsystem.
- Team seats, staff roles, assignment rules, and a full audit platform.
- Public anonymous lead submission by default. See the authentication decision
  below.

## Product and access decisions

### Navigation

Use the agency shell for four primary destinations:

1. **Overview**
2. **Inquiries** — show a count of inquiries in `new` status
3. **Packages**
4. **Profile**

Keep Policy Templates and less-frequent configuration under **Settings**.
Preserve existing links or redirect them when introducing dedicated routes;
do not make an owner lose their place in the current package/profile flows.

### Inquiry identity

For the first release, require an authenticated, active traveler account to
submit an inquiry. Resolve the traveler name and account email from the stored
user record; never accept a traveler ID, contact email, agency ownership, or
claimed role from the request body. The current authentication system has no
email-verification flow, so do not claim the account email is verified or make
inquiry creation depend on an unavailable verification step. Add verified-email
enforcement only alongside an approved verification flow.

The public profile and package remain browseable. If a visitor is not signed in,
the inquiry action should route them through sign-in/sign-up and return them to
the same profile or package after authentication.

If anonymous inquiries later prove necessary for conversion, treat that as a
separate product/security decision. It needs abuse controls, consent and
retention rules, and a verified contact strategy before it is enabled.

### Inquiry status language

Use a small owner-managed pipeline:

| API value | Owner-facing label | Meaning |
| --- | --- | --- |
| `new` | New | Not yet marked as handled by the agency |
| `contacted` | Contacted | The agency says it has reached out |
| `qualified` | Qualified | The agency considers the request a good fit |
| `won` | Converted (agency reported) | The agency reports that it converted outside Travora |
| `closed` | Closed | The agency is no longer pursuing the inquiry |

`won` is self-reported lead outcome only. It must **not** be presented as a
Travora booking, confirmed reservation, payment, or verified revenue.

## User experience and shared UI

### Agency overview

Show the most useful actions and status first:

- Agency approval state with plain-language explanation and next step.
- Profile completion checklist; each incomplete item links to the relevant
  field or page.
- Counts for active/public packages and inquiries in `new`, `contacted`, and
  `qualified` states.
- Latest inquiries with traveler name, associated package (if any), received
  date, and status; selecting one opens its detail.
- Quick actions: create package, open inquiries, preview public profile.

For draft, pending, rejected, or suspended agencies, explain what the owner can
do and what is currently visible to travelers. Do not imply that a pending or
rejected profile is publicly listed.

### Inquiry inbox

- Provide a responsive list/table with status filter, package filter, and
  server-side pagination.
- Desktop may show columns for traveler, package, received date, and status;
  mobile should use compact cards with the same information and actions.
- Selecting an inquiry opens a shared `Sheet` (or `Dialog` where more
  appropriate) with a fixed header and action footer; only the details body
  scrolls.
- Detail includes the traveler’s inquiry message and requested trip details,
  if supplied; a link to the public package; status controls; and a private
  agency note.
- Provide clear loading, empty, error, and stale-data states using
  `LoadingState`, `EmptyState`, `ErrorState`, `Spinner`, and the shared
  pagination/table primitives.
- Confirm destructive or irreversible actions with the established accessible
  confirmation dialog pattern.

### Design-system rules

Follow [`frontend/TRAVORA_FRONTEND_RULES.md`](./frontend/TRAVORA_FRONTEND_RULES.md)
and [`.github/instructions/travora-ui.instructions.md`](./.github/instructions/travora-ui.instructions.md):

- Use `IconSidebar`, `AppShellHeader`, `PageContainer`, and `PageStack` for
  agency shell/layout conventions.
- Use semantic theme tokens only; do not add one-off palette colors.
- Use shared `Card`, `Table`, `Pagination`, and `Sheet`/`Dialog` primitives.
- Keep icon-only controls labelled, status understandable without color alone,
  focus visible, and all actions keyboard-accessible.
- Preserve compact, purposeful spacing and responsive behavior.
- Do not add a one-off chart package or new UI dependency for the MVP.

## Backend implementation plan

Follow the modular-monolith flow and existing Express, TypeScript, Mongoose,
Zod, and `/api/v1` conventions documented in
[`backend/TRAVORA_BACKEND_RULES.md`](./backend/TRAVORA_BACKEND_RULES.md).
Keep the Leads feature in the backend `modules/leads/` module; do not create a
microservice.

### 1. Lead data model

Add a Mongoose `Lead` model with only data needed to respond and measure lead
outcomes. Suggested fields:

- `agencyId` — required `Agency` reference and primary ownership scope.
- `packageId` — optional `Package` reference for profile-level inquiries.
- `travelerId` — required `User` reference for the authenticated submitter.
- A minimal contact snapshot needed to follow up (account email and display
  name; no password/auth data).
- `message` — trimmed and length-limited.
- Optional requested start date and traveler counts, validated to sane bounds.
- `status` — allowlisted enum, default `new`.
- `agencyNote` — private, length-limited note; never returned to the traveler.
- Timestamps and narrowly scoped status-change metadata needed by the inbox.

Do not duplicate unrelated agency/package/user documents into the lead. Do not
store sensitive payment, identity-document, or health information. Decide and
document retention/deletion behavior before launch.

Add indexes based on actual access paths, for example:

- `{ agencyId, createdAt }` for a newest-first inbox.
- `{ agencyId, status, createdAt }` for status filters and counts.
- `{ travelerId, createdAt }` only if a traveler-facing inquiry history is
  included in the MVP.
- `{ packageId, createdAt }` only if package-level counts need it.

Check existing indexes and representative query plans before adding redundant
indexes.

### 2. Module layers and responsibilities

Use only the layers that provide value, following existing modules:

- **validation**: strict Zod schemas for request bodies, IDs, filters, date
  ranges, page, and limit.
- **routes**: mount under `/api/v1`; apply auth, role checks, validation, and
  route-specific rate limiting in the established order.
- **controller**: read identity only from `req.user`; map validated requests to
  service calls; return the standard API response contract.
- **service**: enforce agency approval, package-publication rules, ownership,
  allowed status transitions, and DTO boundaries.
- **repository**: scoped Mongoose queries, bounded pagination, projections, and
  aggregation counts.
- **types/DTOs**: explicit traveler-facing and agency-facing response shapes.

### 3. API contract (proposed)

Keep endpoint names consistent with existing `/api/v1` conventions. One
possible contract is:

| Method and path | Principal | Purpose |
| --- | --- | --- |
| `POST /api/v1/leads` | Active authenticated traveller | Create an inquiry for an approved agency/package |
| `GET /api/v1/leads/mine` | Active authenticated traveller | List only the caller’s own inquiries with bounded pagination |
| `GET /api/v1/leads/mine/:id` | Active authenticated traveller | Read one inquiry belonging to the caller; never include agency-private notes |
| `GET /api/v1/leads` | Agency | List only the caller’s agency inquiries; allowlisted filters and pagination |
| `GET /api/v1/leads/:id` | Agency owner | Read only a lead belonging to the caller’s agency |
| `PATCH /api/v1/leads/:id` | Agency owner | Change status and/or update the agency-private note |
| `GET /api/v1/leads/dashboard` | Agency owner | Return bounded counts and minimal latest-inquiry summaries |

The endpoint layout may be adjusted to fit route composition, but not the
authorization guarantees.

`POST /leads` input must not accept agency owner ID, lead status, role, user ID,
or arbitrary package/agency visibility. Accept only a package/agency selector,
message, and explicitly supported trip details. Resolve and verify all related
records on the server.

For a package inquiry, the service must verify the package belongs to the
selected agency, that the agency is approved, and that the package is public,
active, and still eligible for inquiries. For an agency-profile inquiry,
verify the target agency is approved. Return a generic not-found response for
unavailable/private resources where revealing the distinction would expose
private listing state.

### 4. Dashboard aggregation

Add a read-only summary endpoint scoped from the authenticated agency owner:

- Resolve the owner’s agency using `req.user.sub` and `Agency.ownerUserId`.
- Aggregate package counts by public/active state.
- Aggregate lead counts by status and fetch only a small, newest-first inquiry
  preview.
- Return completion/review state and explicit next-step codes or safe UI
  messages.

Do not trust an `agencyId` query parameter for dashboard scope. Do not count
`Package.meta.bookings` as platform bookings unless an actual booking system
exists. Profile views should remain absent until they are reliably recorded.
Prefer live indexed aggregations over duplicated counters until measurements
show that counts are a bottleneck.

### 5. Notifications for the first release

Do not add email sending or a general-purpose notification subsystem to this
MVP because the backend constitution defers email. The inbox and dashboard can
show inquiries in `new` status, with a manual refresh or modest polling interval
only if required by the existing application behavior. Avoid creating a
separate realtime infrastructure requirement.

Before any later email notification work, select the approved provider,
centralized service, retry behavior, privacy-safe message content, and
unsubscribe/consent policy in a separate change.

## Security and privacy requirements

Treat every lead as sensitive customer data. These are release blockers, not
optional hardening:

1. **Authentication and role**: traveler creation requires an authenticated,
   active traveler account; inbox and dashboard require the agency role.
   Resolve roles and contact details from stored user records. Email
   verification is not currently available in the auth flow.
2. **Owner resolution**: derive the agency from the signed-in user’s
   `ownerUserId` relationship on every agency request. Do not take a client
   agency ID as proof of ownership.
3. **Object-level authorization**: every `GET /leads/:id` and `PATCH` checks
   the lead’s agency owner on the server. An object ID is never authorization.
4. **Relationship checks**: verify agency/package ownership and public status
   on lead creation; do not permit cross-agency package/lead references.
5. **Mass-assignment protection**: use strict schemas and explicit allowlists.
   Never pass `req.body` directly to a Mongoose update.
6. **Bounded queries**: validate status, package ID, sort keys, date ranges,
   `page`, and `limit`; enforce a small maximum page size (for example 50).
   Avoid raw Mongo operators and unescaped regular expressions.
7. **Abuse prevention**: rate-limit inquiry creation by authenticated account
   and client IP using the existing middleware approach; cap message and
   optional-field lengths. Return a stable rate-limit response.
8. **Response minimization**: agency list responses include only fields needed
   for follow-up. Traveler responses never include `agencyNote`, moderation
   metadata, or another traveler’s data. Never return credentials or internal
   document fields.
9. **Safe rendering**: render messages and notes as text; do not interpret
   traveler content as HTML or markdown with unsafe HTML enabled.
10. **Logging**: never log message bodies, contact details, tokens, or request
    bodies containing PII. Log request IDs, actor IDs where appropriate,
    resource IDs, action, result, and safe error codes.
11. **Retention**: establish a retention/deletion policy for inquiries and
    contact snapshots before production; provide a path for account deletion
    and privacy requests.
12. **Chat boundary**: complete a separate review/fix of current conversation
    ownership semantics before linking lead IDs to conversations or exposing
    agency chat to the inbox.

Use the existing auth, role, validation, error, and response helpers where
possible. Do not add a new auth mechanism, datastore, or dependency for this
feature.

## Frontend architecture

### Suggested feature organization

Keep agency screens in the App Router and domain API/types in the existing
feature layout:

```text
frontend/src/app/(agency)/agency/
  page.tsx                 # Overview
  inquiries/page.tsx       # Inbox
  packages/page.tsx        # Existing package-management destination/redirect
  profile/page.tsx         # Profile and readiness

frontend/src/features/leads/
  api/                     # Typed leads/dashboard API calls
  components/              # Inbox, status filter, detail sheet, status badge
  hooks/                   # Query/state logic only where existing patterns need it
  types/                   # Lead DTOs, filters, status values
```

Adapt this structure to the current single-page agency tab implementation
without breaking existing URLs. Prefer real navigable links for primary shell
destinations so deep links, refresh, browser history, and mobile navigation
work predictably.

Use typed API functions over the existing `apiClient`. The UI may hide actions
for role/status UX, but the backend remains the authorization authority.

### Screen states

For every overview/inbox/profile section, define loading, empty, error, and
success states. For inquiry creation, show a clear success confirmation and a
recoverable error; do not clear a message on failed submission. For status
updates, disable duplicate submissions and update the displayed state only
after a successful API response (or use an explicit rollback-safe optimistic
pattern already established in the frontend).

## Delivery phases and acceptance criteria

### Phase 0 — Governance and contract

- The project owner approved lead implementation; the backend lead-security
  rule has been updated accordingly.
- Agree on authenticated-only inquiry creation, status meanings, contact data,
  retention, and whether travelers need an inquiry-history screen.
- Do not connect leads to chat; a separate ownership review is still required.
- Decide and document retention/deletion rules before production launch.

**Exit:** no unresolved ownership, privacy, or product-status decisions.

### Phase 1 — Secure backend lead vertical

- Implement the Leads model, validation, routes, service, repository, DTOs, and
  rate limits.
- Implement authenticated traveler creation and owner-scoped inbox/detail/status
  operations.
- Implement dashboard counts using server-derived agency ownership.
- Add bounded projections, indexes, and safe status transition handling.

**Exit:** a traveler can create a valid inquiry only for an eligible listing;
another agency cannot enumerate, read, update, or count it; input/filters and
response shapes are bounded and documented.

### Phase 2 — Owner inbox and overview

- Add Overview and Inquiries destinations to the agency shell.
- Wire the inquiry list, filters, pagination, detail sheet, status update, and
  agency-private note.
- Replace the profile-only dashboard with approval/readiness, real package
  counts, actionable new inquiry counts, and recent inquiries.
- Keep Profile and Policy Templates accessible under their respective shell
  destinations.

**Exit:** owners can find, review, and manage their own inquiries on mobile and
desktop with accessible loading, empty, and error states.

### Phase 3 — Traveler submission and publish path

- Add inquiry actions to approved public agency profiles and eligible public
  packages.
- Preserve the intended listing after sign-in; require an authenticated active
  traveler account.
- Clearly explain unavailable, private, sold-out, or unapproved listings without
  creating a lead.
- Ensure successful creation appears in the correct agency inbox.

**Exit:** an eligible traveler can submit an inquiry end-to-end, while
ineligible listings and cross-agency references cannot create one.

### Phase 4 — Operational polish

- Add a new-inquiry count in agency navigation and actionable overview cues.
- Review empty/error/retry paths, query performance, data retention and logs.
- Use manual acceptance checks and existing build/type/lint commands, in
  accordance with the repository’s no-test-code rule.

**Exit:** the release checklist below is satisfied; no speculative metrics or
booking claims appear in the UI.

## MVP release checklist

- [ ] Agency owner sees accurate approval and profile-readiness guidance.
- [ ] Owner can navigate to Overview, Inquiries, Packages, Profile, and Settings.
- [ ] Only authenticated active travelers can submit an inquiry; identity and
  contact details are sourced from the stored account record.
- [ ] Inquiry creation validates the agency and any package relationship and
  checks public eligibility server-side.
- [ ] Agency access is derived from the authenticated owner relationship for
  every lead and dashboard query.
- [ ] No user can read or mutate another agency’s or traveler’s lead.
- [ ] The inbox supports useful filters, bounded pagination, detail, note, and
  status update.
- [ ] `won` is clearly self-reported and never represented as a confirmed
  Travora booking or payment.
- [ ] Lead PII is minimized, excluded from logs, access-controlled, and covered
  by a retention/deletion decision.
- [ ] All interactive states follow the shared Travora UI system and are
  keyboard/screen-reader usable.
- [ ] Production build, type-check, lint, and manual acceptance checks pass
  under repository rules.

## Measurement

Start with metrics that the product can truthfully derive:

- total inquiries and counts by status over a defined period;
- active/public package count;
- agency profile approval/completion state.

Add profile/package views only after defining how a view is counted, deduplicated,
and protected from bot inflation. Add conversion-rate reporting only after
inquiry outcomes are collected consistently and clearly marked as
agency-reported. Do not report revenue or bookings without a platform booking
and payment source of truth.

## Research references

- Backend product definition and security constraints:
  [`backend/TRAVORA_BACKEND_RULES.md`](./backend/TRAVORA_BACKEND_RULES.md)
- Current agency shell and profile workflow:
  [`agency-shell.tsx`](./frontend/src/features/agency/components/agency-shell.tsx),
  [`agency/page.tsx`](<./frontend/src/app/(agency)/agency/page.tsx>)
- Current package management and package fields:
  [`packages-tab.tsx`](./frontend/src/features/agency/components/packages-tab.tsx),
  [`package.types.ts`](./frontend/src/features/packages/types/package.types.ts)
- Existing backend agency, package, auth, and chat modules:
  [`agency.routes.ts`](./backend/src/modules/agencies/agency.routes.ts),
  [`package.routes.ts`](./backend/src/modules/packages/package.routes.ts),
  [`auth.middleware.ts`](./backend/src/middleware/auth.middleware.ts),
  [`chat.service.ts`](./backend/src/modules/chat/chat.service.ts)
- Bókun’s operator product pages are useful examples of mature functionality
  such as availability synchronization, automated communications, and direct
  booking/payment. Those are reference points for later phases, not MVP
  requirements:
  [Manage](https://www.bokun.io/manage),
  [Customer communications](https://www.bokun.io/manage/customer-communications),
  [Online booking](https://www.bokun.io/sell/online-booking).
- Google Business Profile guidance emphasizes accurate, complete business
  information, verification, photos, and customer reviews as trust/discovery
  practices:
  [Improve your local ranking on Google](https://support.google.com/business/answer/7091).
