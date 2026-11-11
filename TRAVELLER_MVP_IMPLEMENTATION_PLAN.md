# Travora Traveller Experience — MVP Implementation Plan

## Purpose

Give a traveler a clear, trustworthy path from discovering a trip to contacting
an agency and following up on that inquiry:

> discover packages and agencies → understand the offer → save options →
> contact an agency → track the response.

This plan is the traveler-side counterpart to
[`AGENCY_MVP_IMPLEMENTATION_PLAN.md`](./AGENCY_MVP_IMPLEMENTATION_PLAN.md).
It is a product and implementation plan, not authorization to add booking,
payment, or other future-product capabilities.

## Product boundary

Travora's current business model is lead generation. A package inquiry is a
request to talk with an agency; it is **not** a reservation, booking, price
guarantee, payment, or confirmation of available seats.

The traveler MVP should help people make an informed choice and maintain
control of their inquiry. It should not imply that Travora or an agency has
confirmed a trip.

## Current-state assessment

| Traveler need | Current implementation | Gap |
| --- | --- | --- |
| Browse packages and agencies | Explore page, package filters, public agency pages, and public package data exist. | Package details are primarily modal-based; a durable, shareable package detail route and a consistent empty/error experience are still needed. |
| Refine and share a search | Explore filters are represented in the URL and package results support pagination/loading. | Verify every filter is validated and supported server-side, with stable sorting, pagination, and mobile behavior. Avoid presenting stale or unavailable packages as actionable. |
| Save packages and agencies | Authenticated watchlist API and traveler watchlist screen exist. | Watchlist UI resolves saved records through additional package/agency requests, making the response fragile and inefficient. Availability changes and removed records need explicit states. |
| Contact an agency | The inquiry form is available from public agency/package surfaces and creates an authenticated lead. | There is no traveler-facing inquiry history or detail view. The traveler cannot see whether an agency has marked an inquiry as contacted/closed. |
| Manage account/profile | A traveler profile screen and navigation entry exist. | The screen currently uses hard-coded sample data and local-only edits; it is not connected to a profile API. Avoid collecting extra sensitive fields without a product need. |
| Receive a reply | Chat endpoints and models exist. | Do not assume chat is safe or ready to reuse. Its participant checks and agency/user identity mapping need a dedicated review before traveler messaging is connected. |
| Trust and reviews | Reviews backend routes/models exist. | There is no verified booking record in this lead-generation product to prove a reviewer took a trip. Do not present reviews as verified-trip reviews or enable a public review flow until eligibility and moderation are defined. |
| Get reminders and updates | No traveler notification workflow is currently part of the lead MVP. | Email provider, consent, notification content, and retention decisions are unresolved. Do not add a generic notification platform prematurely. |

## Implementation status

The independent traveler MVP work has now been implemented:

- Public package details are linkable and show agency-provided trip, price,
  capacity, itinerary, inclusion, and policy data with explicit non-booking
  language. Public package search validates and bounds its filters, excludes
  unapproved agencies and expired listings, and can display sold-out trips as
  unavailable.
- The traveler shell includes **My inquiries**. New authenticated Leads
  endpoints return a paginated, caller-owned history and a caller-owned detail
  view; traveler DTOs do not include agency-private notes.
- The profile screen now reads and updates the authenticated user's name
  through a minimal `/api/v1/users/me` API. Email is read-only and its existing
  verification flag is shown without implying a verification flow exists.
- Watchlist writes and reads enforce an active traveler account. Listing
  summaries are loaded in bounded batches, stale/unavailable saved items are
  represented safely, and Explore checks saved state through a bounded
  batch-status API rather than fetching every saved item.
- Backend typecheck/build and frontend typecheck/production build were run for
  these changes. Targeted ESLint passed with warnings only. This does not
  replace automated authorization/DTO tests or production policy decisions.

Chat, transactional email, verified-contact enforcement, account deletion and
retention, and reviews remain gated follow-on work, not implemented traveler
MVP features.

## Traveler journey and navigation

Keep the existing authenticated traveler shell and add only navigation needed to
complete the lead-generation journey:

- **Explore** — searchable packages and agencies, filters, and package details.
- **Saved** — the current watchlist, renamed only if product terminology is
  approved.
- **My inquiries** — submitted inquiry history, status, and safe agency details.
- **Profile** — real account/profile data and account controls.

The public visitor journey stays available without an account: browse packages,
open agency/package details, and understand the offer. Require sign-in to save
across devices or submit an inquiry. Preserve the requested URL through
sign-in/sign-up and return the user to the same package or agency afterward.
Never silently discard a composed inquiry when authentication is required.

## Scope and priorities

### MVP — required for a complete traveler lead journey

1. **Reliable package discovery**
   - Search and filter by destination, dates/flexibility, traveler count,
     duration, theme, price range, and geographic scope where the underlying
     package data supports the filter.
   - Keep filter state in shareable URLs; provide clear active-filter chips,
     reset, result count, sorting, pagination/infinite-load behavior, and
     responsive filter controls.
   - Exclude private, draft, cancelled, expired, and otherwise ineligible
     listings from public results. Make sold-out listings visibly unavailable
     and non-inquirable rather than implying open capacity.
   - Validate and bound all query parameters on the API. Do not trust client
     filtering as an authorization or availability control.

2. **Useful, durable package and agency details**
   - Add a public, linkable package-detail route; keep the modal as a compact
     preview if useful, but make it link to the full detail.
   - Show agency identity, trip dates/duration, destinations, price basis and
     currency, taxes/price validity when supplied, seats/status, itinerary,
     inclusions, exclusions, policies, and a clear inquiry action.
   - Clearly state that displayed package information is agency-provided and
     that an inquiry is not a booking or a price/seat hold.
   - Handle missing images/fields and stale or unavailable packages without
     exposing private or draft package data.

3. **Dependable saved items**
   - Keep package and agency saving available only to an authenticated traveler.
   - Make save/unsave idempotent and safe under concurrent requests.
   - Return a paginated, traveler-scoped watchlist DTO with the required public
     package/agency summary in a bounded query (or bounded aggregation), rather
     than requiring one frontend request per saved item.
   - Represent deleted, private, expired, and sold-out records explicitly as
     unavailable/stale when appropriate; let the traveler remove them.
   - Restore the saved-state UI after sign-in and show loading, retry, empty,
     and partial-data states consistently.

4. **Inquiry submission and traveler follow-up**
   - Reuse the Leads feature; do not create a second inquiry data model.
   - Add a traveler-only, paginated history and a detail screen for the
     authenticated user's own inquiries.
   - Show the agency/package public identity, original request, submitted date,
     and status with clear language. Explain that status reflects the agency's
     reported follow-up, not a confirmed booking.
   - Never return agency-private notes, another traveler's data, internal
     moderation fields, or unrestricted contact details in traveler responses.
   - If an agency closes or updates a lead, show the latest status to the
     submitting traveler. Do not expose agency notes through a shared Lead DTO.
   - Preserve form input and provide explicit success/error/retry behavior.
     Prevent accidental duplicate submission where practical, and retain
     server-side rate limits and eligibility checks.

5. **Real traveler profile**
   - Replace the sample profile state with authenticated data from the backend.
   - Initially support only fields that have a clear use: display name and
     explicitly optional contact/profile preferences. Keep account email
     ownership in the auth/account flow, not as an arbitrary profile edit.
   - Do not collect date of birth, gender, home address, or other sensitive
     personal data unless a specific approved traveler need is identified.
   - Show save state, validation errors, and a clear distinction between
     account identity and optional profile information.

### Follow-on — after MVP usage and policy decisions

- **Secure in-app conversation** tied to a valid inquiry, only after the chat
  module receives an independent authorization review and participant mapping
  is corrected and tested. Keep messages escaped/plain text and rate limited.
- **Transactional email notices** for a submitted inquiry and meaningful
  agency responses only after an approved provider, consent rules, suppression,
  bounce handling, privacy-safe templates, and operational ownership are
  decided. Avoid marketing emails by default.
- **Traveler preferences/recommendations** only after observing search and
  inquiry usage; begin with saved explicit preferences, not opaque profiling.
- **Price/availability-change alerts** only if agencies maintain these fields
  reliably and users can opt in/out of a clearly explained alert.
- **Reviews** only after defining a trustworthy eligibility signal, moderation,
  dispute/report process, and disclosure rules. Lead status alone is not proof
  that a traveler completed a trip.

### Explicitly out of scope for this lead MVP

- Reservations, booking confirmation, inventory holds, payment collection,
  refunds, cancellations of a booking, invoices, or booking support.
- Claims that Travora verifies agency claims, prices, seats, or trip completion
  unless a defined verification process actually exists.
- Public traveler reviews presented as verified bookings.
- Social feeds, traveler-to-traveler messaging, loyalty points, broad CRM,
  recommendation/AI systems, or a general-purpose notification framework.

## Frontend architecture and placement

Follow `frontend/TRAVORA_FRONTEND_RULES.md` and the shared UI system:

- Keep route composition under `frontend/src/app/(traveller)/traveller/`.
- Keep traveler-specific UI, API adapters, and types under
  `frontend/src/features/<feature>/`; reuse the existing `packages`, `public`,
  `watchlist`, `leads`, `auth`, and `traveller` features where they own the
  behavior.
- Extend `TravellerShell` navigation for **My inquiries**; do not duplicate
  sidebar/header markup or create a second shell.
- Add the package detail route under the public package route group so public
  discovery remains shareable. Coordinate the route with existing agency
  package-edit routes to avoid confusing public and owner-only surfaces.
- Reuse shared `PageHeader`, `PageStack`, `Card`, `Table`, `Pagination`,
  `Sheet`, `LoadingState`, `EmptyState`, and `ErrorState` primitives. Keep
  filters in a shared responsive pattern and dialogs/sheets within the
  fixed-header/body/footer convention.
- Keep design tokens, type scale, spacing, border radii, loading states,
  button sizes, focus, and date formatting consistent; do not add one-off
  colors or raw palette values.
- Show no-results, unauthenticated, loading, error, unavailable, and success
  states as first-class states. Keep private inquiry details out of URLs,
  analytics, logs, and client-side error messages.

Suggested feature ownership:

```text
features/public/       public discovery, filters, agency/package presentation
features/packages/     package detail types and package-specific presentation
features/watchlist/    saved items API and traveler saved-items presentation
features/leads/        inquiry form, traveler history/detail, agency inbox DTOs
features/traveller/    traveler shell and traveler-only account/profile UI
features/auth/         sign-in/up, return-to flow, verification when approved
```

Do not introduce a global store or new dependency for this work unless existing
URL state, feature state, and shared primitives demonstrably cannot satisfy the
requirement.

## Backend implementation plan

Use the existing Express/TypeScript/Mongoose modular monolith, versioned REST
API, validation utilities, repositories, services, controllers, and response
conventions. Read and follow `backend/TRAVORA_BACKEND_RULES.md` before backend
changes.

### 1. Traveler profile API

Add a small authenticated self-service API (prefer `/api/v1/users/me`):

- `GET /users/me` returns a minimal, explicit safe profile DTO.
- `PATCH /users/me` accepts only supported profile fields; reject unknown
  fields and never allow changing role, status, email verification, identifiers,
  agency ownership, or other authorization fields through this endpoint.
- Resolve the user ID from the authenticated token and load the active stored
  user. Do not trust a client-supplied user ID.
- Keep email changes in a separate verification-gated auth flow if that
  capability is approved. A user profile edit must not rewrite historical lead
  contact snapshots.
- Do not add DOB/gender/address to the user model just because the current
  placeholder screen displays them.

### 2. Traveler-owned inquiry read API

Extend the existing Leads module with explicit traveler endpoints, for example:

- `GET /api/v1/leads/mine?page=&limit=` — paginated list scoped to the token
  subject and traveler role.
- `GET /api/v1/leads/mine/:id` — one inquiry scoped to the token subject.

Register `/mine` routes before a parameter route such as `/:id`. Keep the
existing agency inbox endpoints agency-only and owner-scoped. Separate
traveler and agency DTO builders/repository projections so an accidental DTO
reuse cannot expose `agencyNote` or traveler PII. Return only necessary public
agency/package fields and the traveler's own submitted message and status.
List records newest first using the `{ travelerId, createdAt }` index already
identified in the agency plan; add the index if that plan's migration work has
not yet created it.

### 3. Watchlist read model

Improve the existing watchlist read path instead of creating another saved-item
service:

- Validate type, page, and bounded limit; require an active traveler.
- Scope every record by the authenticated traveler ID.
- Retrieve item summaries efficiently and consistently; avoid unbounded
  frontend fan-out and N+1 database reads.
- Preserve ownership checks for toggle and saved-state endpoints. Ensure an
  item is eligible for saving, or deliberately support stale saved references
  with a safe unavailable DTO.
- Keep uniqueness constraints for one active save per traveler/item and handle
  duplicate-key races without leaking existence across users.

### 4. Public package discovery and details

- Reuse the current public package endpoints and repository. Add only missing
  query capabilities after confirming actual filter semantics and indexes.
- Validate all filters (date range, counts, range ordering, enum values, text
  length), cap page size, use deterministic sort tie-breakers, and select only
  public fields.
- Enforce `public` visibility and eligible agency/package status in the
  database query, not only in the UI.
- Ensure detail-by-ID/slug uses the same visibility predicate as list results.
- Check query plans and add indexes only for demonstrated high-volume query
  patterns; avoid speculative compound indexes.

### 5. Inquiry/contact safeguards

- Keep lead creation tied to the stored authenticated traveler and eligible
  public package/approved agency; never accept traveler identity/contact data
  from the request body.
- Preserve bounded message/date/traveler-count validation and per-IP plus
  per-account rate limits.
- Before disclosing contact data to an agency, resolve the product decision on
  whether verified email is required. The account model already has an
  `emailVerified` field, but an end-to-end verification flow is not currently
  implemented. Do not claim contact is verified until it is.
- Never log inquiry messages, emails, auth tokens, or verification secrets.
- Establish and document retention, export, and deletion behavior for account,
  saved items, and leads before production release; preserve records only where
  legal or operational requirements demand it.

### 6. Chat and notification boundary

- Do not connect existing chat as part of this implementation until a separate
  review confirms that `travellerId`, `agencyId`, and owner-user identity are
  compared in the correct domains on every read/write path.
- If approved, create/reuse a conversation only for a valid traveler-owned
  lead and its agency, then enforce participant membership at the service and
  repository boundaries for every operation.
- Email or push notifications are a separate approved phase; do not install a
  provider or add an unbounded notification subsystem as an implicit
  dependency.

## Security, privacy, accessibility, and reliability

- Authentication is not authorization: verify the stored active role and
  owner/subject relationship on every protected endpoint.
- Return `404` or the repository-standard safe denial for records a user does
  not own; do not permit object-ID enumeration to reveal private records.
- Validate and bound inputs and pagination; use explicit response DTOs and
  least-privilege projections.
- Rate limit inquiry creation and any future verification, messaging, and
  account-recovery endpoints.
- Do not store sensitive profile data without a product purpose. Keep
  verification tokens hashed, short-lived, single-use, and rate-limited if
  verification is implemented.
- Use semantic labels, keyboard-accessible filters and sheets, visible focus,
  appropriate status announcements, and mobile-readable layouts.
- Avoid optimistic state that cannot be rolled back. Preserve retry actions and
  explain when a saved package or inquiry is no longer available.
- Do not promise availability, booking, verification, or agency response times
  that the backend cannot guarantee.

## Delivery phases and acceptance criteria

### Phase 0 — Product contracts

- Confirm product wording for inquiry statuses, package availability, profile
  fields, verified-email expectations, retention/deletion, and notification
  policy.
- Confirm which current public package and watchlist endpoints will be extended.
- Independently review chat authorization before considering any messaging
  integration.

**Exit:** agreed data/DTO contracts and explicit non-booking language are
reviewed before implementation.

### Phase 1 — Profile and traveler inquiry history

- Implement the real profile API and replace sample profile data.
- Add traveler-scoped inquiry list/detail endpoints and DTOs.
- Add **My inquiries** route and shell navigation using the shared UI system.
- Test unauthorized, wrong-role, and cross-traveler access.

**Exit:** a traveler can sign in, see their own profile and inquiry history,
and cannot read another traveler's record or agency-private notes.

### Phase 2 — Discovery and package details

- Verify/fix API filters, query validation, pagination, stable sorting, and
  public visibility eligibility.
- Add a durable public package detail route and inquiry entry point.
- Ensure URL filters restore correctly and all loading/empty/error/unavailable
  states are accessible and consistent.

**Exit:** a visitor can share a filtered search or package link and see only
eligible public listings with clear price/status context.

### Phase 3 — Watchlist reliability

- Return a bounded watchlist summary that avoids per-item frontend requests.
- Cover unavailable/stale records and concurrent save/unsave behavior.
- Verify traveler isolation and stable pagination.

**Exit:** a traveler can save, revisit, and remove packages/agencies reliably,
including when an item changes availability.

### Phase 4 — End-to-end inquiry polish

- Connect package and agency detail CTAs to the inquiry form and return-to flow.
- Confirm success/error behavior and that the traveler's history reflects
  agency status updates without exposing private notes.
- Complete any separately approved email verification prerequisite.

**Exit:** an eligible traveler can submit an inquiry, see it in their own
history, and understand what its status does and does not mean.

### Phase 5 — Measured follow-up improvements

- Consider in-app conversation and transactional notifications only after the
  relevant security and operational gates are satisfied.
- Prioritize further improvements from observed search-to-inquiry completion,
  filter usage, watchlist return, and inquiry follow-up metrics.

**Exit:** each follow-on feature has a measured user need, an owner, a privacy
review, and explicit acceptance criteria.

## Release checklist

- [ ] Public browse and detail routes never expose private/draft agency data.
- [ ] Search filters and pagination are validated server-side and bounded.
- [ ] Inquiry creation derives traveler identity from the authenticated stored
  user and applies eligibility checks and rate limits.
- [ ] A traveler can list/read only their own inquiry; agency notes and
  unrelated contact data are never returned.
- [ ] Profile API cannot mutate role, email-verification, status, or owner fields.
- [ ] Watchlist operations are traveler-scoped, bounded, and resilient to stale
  records and duplicate requests.
- [ ] No UI implies an inquiry is a booking, seat hold, or confirmed price.
- [ ] No unverified traveler review is described as a completed-trip review.
- [ ] No chat integration ships before ownership/participant authorization has
  been independently reviewed and tested.
- [ ] Sensitive messages, email addresses, tokens, and verification secrets are
  excluded from logs and analytics.
- [ ] Retention/deletion, email verification, and notification-provider
  decisions are resolved before enabling dependent production behavior.
- [ ] Frontend lint/typecheck/build and backend typecheck/build pass; tests cover
  owner isolation, role boundaries, validation, and response DTO privacy.

## Product metrics

Measure only what is needed to improve the journey, with approved privacy-safe
analytics:

- search-to-package-detail engagement,
- filter use and no-result frequency,
- package-detail-to-inquiry start and completion,
- inquiry form error and abandonment rate,
- saved-item revisit rate,
- time from agency status update to traveler-visible history update.

Do not count inquiries as bookings, revenue, or completed trips.

## Decisions still needed before dependent work

1. **Email verification:** should a verified account email be required before
   an agency receives traveler contact details? The user model has a
   verification flag but no completed verification flow.
2. **Retention/deletion:** what are the approved retention and account-deletion
   rules for traveler profiles, inquiry messages, and lead contact snapshots?
3. **Notifications:** should the MVP rely on the in-app inquiry history, or is
   transactional email required for agency responses? If required, approve a
   provider, consent rules, and operational ownership first.
4. **Chat:** authorize a separate review/fix of the existing chat participant
   checks before deciding whether it belongs in the traveler MVP.
5. **Reviews:** define a verifiable eligibility and moderation policy before
   enabling public reviews in a product without confirmed bookings.
