# Travora Agency Feature Research & Implementation Plan

> **Product:** Travora — Travel & Tour Agency Lead-Generation Platform
> **Status:** V1 MVP — Agency Feature Expansion
> **Date:** November 2026
> **Author:** AI Research Agent (Cline)
> **Scope:** Full-stack agency features — Backend + Frontend, in-depth

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Code Architecture Analysis](#code-architecture-analysis)
3. [Web Research: Travel Agency Industry Landscape](#web-research-travel-agency-industry-landscape)
4. [Complete Feature List — In-Depth](#complete-feature-list-in-depth)
5. [API Contract Design](#api-contract-design)
6. [Database Schema Design](#database-schema-design)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Security & Compliance](#security--compliance)
9. [Release Checklist](#release-checklist)
10. [References](#references)

---

## 1. Executive Summary

Travora is a **lead-generation marketplace** where travelers discover travel agencies and handcrafted journeys, then connect directly with agencies to plan trips. The agency feature expansion builds on the existing V1 MVP foundation (modular monolith Express backend + Next.js App Router frontend) to give agency owners:

- A publishable agency profile with verification/approval workflow
- Travel package creation and management (public/draft/archive)
- Inquiry/lead inbox with status tracking and internal notes
- Dashboard with real operational metrics
- Traveler inquiry submission tied to approved agencies/packages

**Business model:** Lead generation only — no booking confirmation, payment collection, or refunds in V1.

---

## 2. Code Architecture Analysis

### Backend Architecture

**Technology Stack (locked):**
- Runtime: Node.js (>= 20)
- Framework: Express.js
- Language: TypeScript (strict mode)
- Database: MongoDB via Mongoose
- Validation: Zod
- API style: REST under `/api/v1`
- Logging: Pino (structured)
- Security: Helmet, CORS, express-rate-limit
- File storage: Filebase (S3-compatible) for agency logos/package images

**Architectural pattern:** Modular Monolith — one deployable app with clear feature-module boundaries.

**Request flow:**
```
HTTP Request → Express Middleware (security, request-id, logging, CORS, rate limit)
  → Route (/api/v1/...) → Validation (Zod) → Controller (thin, HTTP only)
  → Service (business rules, framework-agnostic) → Repository (persistence boundary)
  → Mongoose Model → MongoDB
```

**Response flow:** Mirrors request in reverse through a DTO/serializer layer — clients never receive raw database documents.

**Feature module pattern:**
```
modules/<feature>/
  <feature>.model.ts      # Mongoose schema + model
  <feature>.schema.ts     # Zod validation schemas
  <feature>.repository.ts # Data access layer
  <feature>.service.ts    # Business logic
  <feature>.controller.ts # Thin HTTP handlers
  <feature>.routes.ts     # Express route definitions
  <feature>.types.ts      # TypeScript types/DTOs
  index.ts                # Module exports
```

**Existing backend modules:** `agencies`, `packages`, `auth`, `chat`, `policy-templates`

**API response format:**
```json
// Success
{ "success": true, "data": {}, "meta": {} }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }
```

### Frontend Architecture

**Technology Stack (locked):**
- Framework: Next.js 16 (App Router)
- Language: TypeScript (strict)
- Runtime: React 19
- Styling: Tailwind CSS v4
- Components: shadcn/ui (Radix UI primitives)
- Icons: Lucide React
- Fonts: Inter (via next/font)
- Lint: ESLint 9 (flat config)

**Architectural pattern:** Feature-oriented layout with one-way dependency: `app` → `features` → `components/lib`.

**Route groups:**
- `(public)` — Unauthenticated routes (landing, marketing)
- `(auth)` — Future authentication routes
- `(agency)` — Agency-facing routes (current focus)
- `(traveller)` — Traveller-facing routes
- `(admin)` — Future admin routes

**API boundary:** `src/lib/api/client.ts` provides typed `fetch`-based client (`createApiClient`) targeting `/api/v1/...`. No direct `fetch()` calls scattered across components.

**Design system:** Semantic CSS variables in `src/app/globals.css`, mapped to Tailwind tokens via `@theme inline`. Brand: Primary #2563EB (blue), Secondary #0F766E (teal), Accent #F59E0B (amber).

### Existing Agency-Related Code

| File | Purpose | Status |
|------|---------|--------|
| `frontend/src/features/agency/components/agency-shell.tsx` | Agency shell with Dashboard, Packages, Settings navigation | Exists |
| `frontend/src/app/(agency)/agency/page.tsx` | Agency dashboard — profile summary, approval status | Exists (basic) |
| `frontend/src/features/agency/components/packages-tab.tsx` | Package create/manage — visibility, status, dates, price, capacity | Exists |
| `frontend/src/features/packages/types/package.types.ts` | Package types — `TravelPackage`, `CreatePackageInput`, status, visibility enums | Exists |
| `backend/src/modules/agencies/` | Agency model, routes, controller, service, validation, storage | Exists (basic) |
| `backend/src/modules/packages/` | Package CRUD, image upload, status, policy templates | Exists |
| `backend/src/modules/chat/` | Authenticated chat module | Exists (needs ownership review) |
| `frontend/src/features/leads/` | Leads module — API, components, types | Partial (inquiry inbox exists) |

---

## 3. Web Research: Travel Agency Industry Landscape

### Common Problems Faced by Travel Agencies

Based on research from TravelOperations' "State of Travel Agency Operations" benchmark (Oct–Nov 2025) and industry sources:

| Problem | Prevalence | Impact |
|---------|------------|--------|
| **Manual / repetitive data entry** | 65.3% of agencies | Repeated entry across systems, human error, slower processing, staff dependence |
| **Disconnected / poorly integrated systems** | 50.0% of agencies | Workflows span multiple non-communicating systems; staff re-enter information |
| **Rising operational costs** | 51.4% of agencies | Labor-intensive workflows drive cost pressure; scaling increases workload proportionally |
| **Delayed reporting / limited visibility** | Cited widely | No real-time operational data; decisions made on stale information |
| **Workflow inefficiency** | Dominant challenge | Manual steps scale linearly with booking volume; growth exposes structural weaknesses |

**Key insight:** The industry's primary friction is **internal operational efficiency**, not customer demand. Agencies need systems that integrate workflows, reduce duplicate data entry, and improve reporting visibility.

### Essential Agency Software Features (Industry Standard)

Research from TravelBoost (2026), Ajgori Technologies buyer checklist (2026), and Acquaint Softtech OTA architecture guide identifies five essential feature groups:

#### 3.1 Booking & Supplier Features
- Search across products (flights, hotels, tours, transfers)
- Supplier connections (GDS, direct supplier APIs)
- Price checks before booking; fare/rate change handling
- Booking, ticketing, voucher issuance (e-tickets, hotel vouchers)
- Booking status tracking (confirmed, failed, pending)
- Cancellations and changes via supplier
- Markup rules by product, supplier, route, customer type
- Offline/manual booking entry (all bookings in one place)
- Supplier request/response logging per booking (for support/disputes)
- Customer-facing direct booking on agency website

#### 3.2 Customer & Agent Management
- Customer records: contact details, travel history, preferences
- Saved travellers (family members) to avoid retyping passenger details
- Customer accounts: view bookings and documents
- Agent/sub-agent accounts (for agencies selling through other agencies)
- Agent pricing and commissions (different rates per agent)
- Credit limits and deposit wallets for agents on account
- Communication history per booking
- Marketing consent (privacy compliance per market)
- Travel CRM linking customer + booking data

#### 3.3 Accounting, Invoices & Reports
- Payment processing and tracking
- Invoice generation
- Refund handling
- Supplier payables and reconciliation
- Financial reports (P&L, commission, aged receivables)

#### 3.4 Roles, Permissions & Audit
- Role-based access control
- Two-step login (2FA/MFA) for staff
- Audit history: who created/changed/cancelled each booking, when
- Approval steps for sensitive actions (large refunds, credit limit changes)
- Data export capability
- Backups and security update responsibility

#### 3.5 Features That Can Wait (V2+)
- Additional products beyond core offering
- Loyalty points, referral schemes, gift vouchers
- Mobile apps (if mobile web works well)
- Advanced personalization and recommendations
- Full automation of rare processes
- Custom dashboards beyond core reports

### OTA Architecture Reference

From Acquaint Softtech's OTA architecture guide (2026), a production travel platform architecture includes:

**Layers:**
1. **Presentation Layer** — Web/mobile UI, admin portal, B2B partner portal
2. **API Gateway / Middleware** — Authentication, rate limiting, request routing
3. **Business Logic Layer** — Search, booking, pricing, payment, inventory services
4. **Integration Layer** — GDS connections, supplier APIs, payment gateways
5. **Data Layer** — MongoDB (primary), Redis (caching), search engine (Elasticsearch)
6. **Infrastructure Layer** — Cloud hosting, CDN, monitoring, CI/CD

**Key modules:** User management, inventory management, booking engine, payment processing, notification service, reporting/analytics, admin panel.

---

## 4. Complete Feature List — In-Depth

### 4.1 Agency Profile & Verification

#### Backend

| Feature | Description | Priority |
|---------|-------------|----------|
| Agency registration (draft) | Owner creates agency profile in draft mode; not public until approved | P0 |
| Agency profile fields | Legal name, trading name, slug (unique), email, phone, address, website, tax ID, license number, description, categories/specialties, years in business, team size | P0 |
| Agency logo upload | Image upload via Filebase (JPEG/PNG/WebP, max 5MB), public CDN URL | P0 |
| Agency cover images | Optional cover/gallery images for public profile | P1 |
| Slug availability check | Validate unique agency URL slug before creation | P0 |
| Agency submission for review | Owner submits draft agency for admin approval | P0 |
| Agency approval workflow | Admin reviews and approves/rejects; approval state + reason stored | P0 |
| Agency public profile | Read-only public agency page by slug (for traveler discovery) | P0 |
| Agency owner relationship | `ownerUserId` links agency to authenticated user; ownership derived server-side | P0 |
| Agency status enum | `draft`, `submitted`, `approved`, `rejected`, `suspended` | P0 |
| Agency verification badge | Verified status displayed on public profile after approval | P1 |
| Agency documents | Optional upload of license/insurance documents for verification | P1 |

#### Frontend

| Feature | Description | Priority |
|---------|-------------|----------|
| Agency profile creation form | Multi-step form for agency details with draft/save and submit | P0 |
| Profile completion checklist | Visual progress bar showing required vs optional fields | P0 |
| Logo upload UI | Drag-drop image upload with preview, crop, and delete | P0 |
| Public profile preview | Read-only view of how the agency appears to travelers | P0 |
| Approval status display | Current state (draft/submitted/approved/rejected) with explanation and next steps | P0 |
| Edit agency profile | Update agency details (re-submission triggers re-review if key fields change) | P0 |

---

### 4.2 Travel Package Management

#### Backend

| Feature | Description | Priority |
|---------|-------------|----------|
| Package CRUD | Create, read, update, delete travel packages owned by the agency | P0 |
| Package fields | Title, description, destination(s), duration (days/nights), start/end dates, price, price type (fixed/per person), capacity (max travelers), availability spots, geographic scope, trip theme, category | P0 |
| Package status enum | `draft`, `active`, `completed`, `archived`, `sold_out` | P0 |
| Package visibility enum | `public`, `private`, `unlisted` | P0 |
| Package images | Multiple images with presigned upload URLs, primary image designation, reordering, deletion | P0 |
| Package policies | Cancellation policy, refund policy, terms (linked to policy templates) | P0 |
| Package metadata | View count, inquiry count, booking count (agency-reported), featured flag | P0 |
| Package date ranges | Upcoming, current, historical package views | P0 |
| Package search/filter | Filter by destination, theme, price range, dates, duration | P0 |

#### Frontend

| Feature | Description | Priority |
|---------|-------------|----------|
| Package creation form | Rich form with all package fields, image upload, policy selection | P0 |
| Package list/grid | View all agency packages with status, dates, inquiry counts | P0 |
| Package detail edit | Edit individual package with inline status toggle | P0 |
| Package image gallery | Upload, reorder, set primary, delete images | P0 |
| Package status management | Activate/archive/sell-out packages with confirmation | P0 |
| Package preview | See how package appears to travelers before publishing | P1 |
| Package duplication | Duplicate an existing package as a new draft | P1 |

---

### 4.3 Lead Generation & Inquiry Management

#### Backend

| Feature | Description | Priority |
|---------|-------------|----------|
| Inquiry creation | Traveler submits inquiry for agency (+ optional package); validates agency is approved and package is public/eligible | P0 |
| Inquiry fields | Traveler name, email, phone, message, travel dates, number of travelers, budget, special requests, agency ID, package ID (optional), status, agency note (internal), source | P0 |
| Lead status enum | `new`, `contacted`, `in_progress`, `quoted`, `won` (self-reported), `lost`, `archived` | P0 |
| Agency inbox | List inquiries belonging to the authenticated agency owner; pagination, filters (status, date range, package) | P0 |
| Lead detail | Read one inquiry; agency-private notes hidden from traveler responses | P0 |
| Status update | Agency owner changes lead status + internal note | P0 |
| Inquiry ownership enforcement | Server-side check that agency owns the lead; no cross-agency access | P0 |
| Traveler inquiry history | Traveler lists their own inquiries; never sees agency notes or other travelers' data | P0 |
| Rate limiting | Rate-limit inquiry creation per authenticated account and IP | P0 |
| PII minimization | Inquiry PII excluded from logs; access-controlled; retention policy | P0 |
| Inquiry dashboard stats | Counts by status over a defined period | P0 |

#### Frontend

| Feature | Description | Priority |
|---------|-------------|----------|
| Inquiry inbox | Table/list of inquiries with status badges, date, traveler name, package | P0 |
| Inquiry filters | Status filter, date range, package filter, search | P0 |
| Pagination | Bounded pagination (max 50 per page) | P0 |
| Inquiry detail sheet | Modal or page showing full inquiry details, traveler contact, message, dates | P0 |
| Status update dropdown | Change inquiry status with optional internal note | P0 |
| Internal notes | Agency-only text area for notes on each inquiry (not visible to traveler) | P0 |
| Inquiry form (traveler side) | Form on agency public page or package page to submit inquiry | P0 |
| My inquiries (traveler side) | Traveler's inquiry history with status and agency responses | P0 |
| Empty/inquiry states | Empty state when no inquiries, loading, error states | P0 |

---

### 4.4 Dashboard & Analytics

#### Backend

| Feature | Description | Priority |
|---------|-------------|----------|
| Dashboard stats endpoint | Total inquiries, counts by status, active/public package count, profile completion state | P0 |
| Time-series data | Inquiry counts over defined period (daily/weekly/monthly) | P1 |
| Conversion metrics | Inquiry → won (self-reported, clearly marked as agency-reported) | P1 |
| Package performance | Views, inquiries, bookings per package | P1 |
| Revenue reporting | NOT in V1 — deferred until booking/payment source of truth exists | Deferred |

#### Frontend

| Feature | Description | Priority |
|---------|-------------|----------|
| Dashboard overview | Agency status, profile readiness, package counts, inquiry counts by state | P0 |
| Quick actions | Create package, view inbox, edit profile, submit agency | P0 |
| Inquiry activity chart | Simple chart of inquiries over time | P1 |
| Package performance cards | Top packages by inquiries/views | P1 |
| Readiness checklist | Profile completion steps with links to complete each | P0 |

---

### 4.5 Settings & Administration

#### Backend

| Feature | Description | Priority |
|---------|-------------|----------|
| Agency settings | Update contact info, business details, notification preferences | P0 |
| Owner management | View current owner; transfer ownership (future) | P1 |
| Team members | Add/remove staff users with roles (future) | P1 |
| API access | Regenerate API keys (future) | P1 |
| Data export | Export agency data (inquiries, packages) | P1 |
| Account deletion | Request account/data deletion (privacy compliance) | P1 |

#### Frontend

| Feature | Description | Priority |
|---------|-------------|----------|
| Settings page | Agency settings form, change password, notification preferences | P0 |
| Profile settings | Edit agency business information | P0 |
| Security settings | Password change, session management | P1 |
| Billing settings | NOT in V1 — deferred | Deferred |

---

### 4.6 Traveler-Facing Agency Discovery

#### Backend

| Feature | Description | Priority |
|---------|-------------|----------|
| Public agency listing | List approved agencies with filters (location, specialty, rating) | P0 |
| Public agency detail | Read-only agency profile by slug | P0 |
| Public package listing | List public packages across all approved agencies | P0 |
| Public package detail | Read-only package details with inquiry CTA | P0 |
| Agency search | Search agencies by name, destination, specialty | P1 |
| Agency verification filter | Filter to show only verified agencies | P1 |

#### Frontend

| Feature | Description | Priority |
|---------|-------------|----------|
| Agency browse page | Grid of agencies with filter sidebar | P0 |
| Agency detail page | Agency info, packages, inquiry button, reviews (future) | P0 |
| Package browse page | Grid of packages with filters | P0 |
| Package detail page | Package info, dates, price, images, inquiry form | P0 |
| Inquiry CTA button | "Send Inquiry" on agency/package pages (traveler must be authenticated) | P0 |

---

### 4.7 Communications & Chat Integration

| Feature | Description | Priority |
|---------|-------------|----------|
| Lead-to-chat boundary | **DO NOT** link leads to chat until chat ownership/agency authorization is reviewed | Deferred |
| Inquiry status updates | Status changes on leads (replaces need for real-time chat in V1) | P0 |
| Email notifications | NOT in V1 — deferred until email provider decision | Deferred |
| Real-time chat | NOT in V1 — deferred until security review complete | Deferred |

---

### 4.8 Payments & Commission (Future Phase)

| Feature | Description | Priority |
|---------|-------------|----------|
| Payment processing | NOT in V1 — lead generation only | Deferred |
| Commission tracking | NOT in V1 | Deferred |
| Invoicing | NOT in V1 | Deferred |
| Refunds | NOT in V1 | Deferred |

---

## 5. API Contract Design

### Agency Endpoints

| Method | Path | Principal | Purpose |
|--------|------|-----------|---------|
| GET | `/api/v1/agencies/me` | Agency owner | Get own agency profile |
| POST | `/api/v1/agencies/me` | Agency owner | Create agency (draft) |
| PATCH | `/api/v1/agencies/me` | Agency owner | Update own agency |
| POST | `/api/v1/agencies/me/submit` | Agency owner | Submit agency for approval |
| POST | `/api/v1/agencies/me/logo` | Agency owner | Upload agency logo |
| GET | `/api/v1/agencies/slug/check` | Public | Check slug availability |
| GET | `/api/v1/agencies/:slug` | Public | Get public agency profile |
| GET | `/api/v1/agencies` | Public/Admin | List approved agencies (with filters) |

### Package Endpoints

| Method | Path | Principal | Purpose |
|--------|------|-----------|---------|
| GET | `/api/v1/packages` | Agency owner | List own packages |
| GET | `/api/v1/packages/upcoming` | Agency owner | List upcoming packages |
| GET | `/api/v1/packages/current` | Agency owner | List current packages |
| GET | `/api/v1/packages/history` | Agency owner | List historical packages |
| GET | `/api/v1/packages/:id` | Agency owner | Get package detail |
| POST | `/api/v1/packages` | Agency owner | Create package |
| PATCH | `/api/v1/packages/:id` | Agency owner | Update package |
| PATCH | `/api/v1/packages/:id/status` | Agency owner | Update package status |
| DELETE | `/api/v1/packages/:id` | Agency owner | Delete package |
| POST | `/api/v1/packages/:id/images` | Agency owner | Upload package images |
| GET | `/api/v1/packages/:id/images/presigned-url` | Agency owner | Get presigned upload URL |
| DELETE | `/api/v1/packages/:id/images/:imageId` | Agency owner | Delete package image |
| GET | `/api/v1/packages/public` | Public | List public packages |
| GET | `/api/v1/packages/public/:id` | Public | Get public package detail |

### Lead/Inquiry Endpoints

| Method | Path | Principal | Purpose |
|--------|------|-----------|---------|
| POST | `/api/v1/leads` | Authenticated traveller | Create inquiry for approved agency/package |
| GET | `/api/v1/leads/mine` | Authenticated traveller | List own inquiries |
| GET | `/api/v1/leads/mine/:id` | Authenticated traveller | Read own inquiry (no agency notes) |
| GET | `/api/v1/leads` | Agency owner | List agency inquiries (filters + pagination) |
| GET | `/api/v1/leads/:id` | Agency owner | Read agency lead |
| PATCH | `/api/v1/leads/:id` | Agency owner | Update status + internal note |
| GET | `/api/v1/leads/dashboard` | Agency owner | Dashboard stats (counts by status) |

### Dashboard Endpoints

| Method | Path | Principal | Purpose |
|--------|------|-----------|---------|
| GET | `/api/v1/dashboard/agency` | Agency owner | Dashboard overview stats |

---

## 6. Database Schema Design

### Agency Collection

```typescript
interface Agency {
  _id: ObjectId;
  ownerUserId: ObjectId;        // Ref to User — ownership, immutable after creation
  legalName: string;
  tradingName: string;
  slug: string;                 // unique, URL-friendly
  email: string;
  phone: string;
  address: Address;
  website?: string;
  taxId?: string;
  licenseNumber?: string;
  description: string;
  specialties: string[];        // e.g., ["luxury", "adventure", "family"]
  yearsInBusiness?: number;
  teamSize?: number;
  logoUrl?: string;             // Filebase CDN URL
  coverImages: string[];        // Filebase CDN URLs
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: ObjectId;        // admin user
  verificationBadge: boolean;
  documents: Document[];        // license, insurance uploads
  createdAt: Date;
  updatedAt: Date;
}
```

### Package Collection

```typescript
interface TravelPackage {
  _id: ObjectId;
  agencyId: ObjectId;           // Ref to Agency
  title: string;
  slug: string;                 // unique within agency
  description: string;
  destinations: string[];
  durationDays: number;
  durationNights: number;
  startDate: Date;
  endDate: Date;
  price: number;
  priceType: 'fixed' | 'per_person';
  currency: string;             // default USD
  capacity: number;             // max travelers
  availableSpots: number;
  geographicScope: 'domestic' | 'regional' | 'international';
  tripTheme: string[];          // e.g., ["beach", "cultural", "adventure"]
  category: string;
  images: PackageImage[];       // url, isPrimary, order
  policies: { cancellation: string; refund: string; terms: string };
  status: 'draft' | 'active' | 'completed' | 'archived' | 'sold_out';
  visibility: 'public' | 'private' | 'unlisted';
  isFeatured: boolean;
  viewCount: number;
  inquiryCount: number;
  bookingCount: number;         // agency-reported, self-attested
  createdAt: Date;
  updatedAt: Date;
}
```

### Lead/Inquiry Collection

```typescript
interface Lead {
  _id: ObjectId;
  agencyId: ObjectId;           // Ref to Agency
  travellerId: ObjectId;        // Ref to User
  packageId?: ObjectId;         // Ref to Package (optional)
  travellerName: string;
  travellerEmail: string;
  travellerPhone: string;
  message: string;
  travelStartDate?: Date;
  travelEndDate?: Date;
  numberOfTravelers: number;
  budget?: number;
  specialRequests?: string;
  status: 'new' | 'contacted' | 'in_progress' | 'quoted' | 'won' | 'lost' | 'archived';
  agencyNote?: string;          // internal, never exposed to traveller
  source: 'website' | 'package_page' | 'agency_page';
  createdAt: Date;
  updatedAt: Date;
}

---

## 7. Implementation Roadmap

### Phase 1: Backend Foundation (Weeks 1–2)

| Week | Task | Deliverable |
|------|------|-------------|
| 1 | Agency model + validation schemas | `agency.model.ts`, `agency.schema.ts`, `agency.types.ts` |
| 1 | Agency service + repository | Business logic, data access |
| 1 | Agency controller + routes | `/api/v1/agencies/me/*` endpoints |
| 2 | Package model extensions | Status, visibility, metadata fields |
| 2 | Lead model + validation schemas | `lead.model.ts`, `lead.schema.ts`, `lead.types.ts` |
| 2 | Lead service + controller + routes | `/api/v1/leads/*` endpoints |
| 2 | Dashboard stats endpoint | `/api/v1/dashboard/agency` |

### Phase 2: Frontend — Agency Dashboard (Weeks 3–4)

| Week | Task | Deliverable |
|------|------|-------------|
| 3 | Agency profile page | Create/edit agency, logo upload, completion checklist |
| 3 | Agency shell navigation | Dashboard, Packages, Inquiries, Profile, Settings links |
| 3 | Package management UI | Package list, create, edit, status toggle, image gallery |
| 4 | Inquiry inbox | Lead list with filters, pagination, status update, internal notes |
| 4 | Dashboard overview | Stats cards, readiness checklist, quick actions |

### Phase 3: Frontend — Traveler-Facing Discovery (Weeks 5–6)

| Week | Task | Deliverable |
|------|------|-------------|
| 5 | Public agency listing | Browse agencies, filters, agency detail page |
| 5 | Public package listing | Browse packages, filters, package detail page |
| 5 | Inquiry form (traveller) | Submit inquiry from agency/package page |
| 6 | My inquiries (traveller) | Traveller inquiry history page |
| 6 | Public profile preview | Agency owner preview of public profile |

### Phase 4: Hardening & Release (Week 7)

| Task | Deliverable |
|------|-------------|
| Security review (ownership, authorization, PII) | Audit all endpoints |
| Rate limiting | Inquiry creation rate limits |
| Pagination bounds | Max 50 per page everywhere |
| Error handling | Consistent error responses |
| Build + type-check + lint | Zero errors |
| Manual acceptance testing | All release checklist items |
| Documentation | API docs, feature docs updated |

---

## 8. Security & Compliance

### Authorization Rules

1. **Owner resolution:** Agency is derived from `req.user.ownerUserId` — never trust a client-supplied agency ID.
2. **Object-level authorization:** Every `GET /leads/:id` and `PATCH` verifies the lead's `agencyId` matches the authenticated owner's agency.
3. **Relationship checks:** Lead creation validates agency is `approved` and package is `public`/eligible; no cross-agency references.
4. **Mass-assignment protection:** Strict Zod schemas + explicit allowlists; never pass `req.body` directly to Mongoose update.
5. **Response minimization:** Traveler responses never include `agencyNote`, moderation metadata, or other travelers' data.
6. **PII handling:** Inquiry PII excluded from logs; access-controlled; retention/deletion policy required before production.

### Rate Limiting

- Inquiry creation: rate-limited per authenticated account AND client IP
- Logo upload: 10 requests per 15-minute window (existing pattern)
- General API: global rate limiter (existing)

### Data Retention

- Retention/deletion policy for inquiries and contact snapshots must be established before production
- Path for account deletion and privacy requests (GDPR/CCPA)

---

## 9. Release Checklist

- [ ] Agency owner sees accurate approval and profile-readiness guidance
- [ ] Owner can navigate to Overview, Inquiries, Packages, Profile, and Settings
- [ ] Only authenticated active travelers can submit an inquiry; identity sourced from stored account
- [ ] Inquiry creation validates agency approval and package eligibility server-side
- [ ] Agency access derived from authenticated owner relationship for every lead/dashboard query
- [ ] No user can read or mutate another agency's or traveler's lead
- [ ] Inbox supports filters, bounded pagination, detail, note, and status update
- [ ] `won` is clearly self-reported, never represented as confirmed Travora booking/payment
- [ ] Lead PII minimized, excluded from logs, access-controlled, retention policy defined
- [ ] All interactive states follow Travora UI system; keyboard/screen-reader usable
- [ ] Production build, type-check, lint, and manual acceptance checks pass
- [ ] No user can access another agency's packages or leads
- [ ] Agency status transitions enforced server-side (draft → submitted → approved/rejected)

---

## 10. References

### Internal (Codebase)

1. `backend/README.md` — Backend foundation, stack, architecture, folder structure
2. `backend/TRAVORA_BACKEND_RULES.md` — Backend engineering constitution (security, validation, authorization)
3. `frontend/README.md` — Frontend foundation, stack, architecture, design system
4. `frontend/TRAVORA_FRONTEND_RULES.md` — Frontend engineering constitution (components, accessibility, design tokens)
5. `AGENCY_MVP_IMPLEMENTATION_PLAN.md` — Existing agency MVP implementation plan
6. `frontend/src/features/agency/components/agency-shell.tsx` — Agency shell navigation
7. `frontend/src/app/(agency)/agency/page.tsx` — Agency dashboard page
8. `frontend/src/features/agency/components/packages-tab.tsx` — Package management UI
9. `frontend/src/features/packages/types/package.types.ts` — Package types
10. `backend/src/modules/agencies/agency.routes.ts` — Agency routes
11. `backend/src/modules/packages/package.routes.ts` — Package routes

### External (Web Research)

1. [TravelBoost — Travel Agency Management Software: 10 Powerful Features You Need in 2026](https://travelboost.app/blog/travel-agency-management-software)
2. [TravelOperations — Travel Agency Operations: The 5 Biggest Operational Challenges](https://traveloperations.com/general/travel-agency-operations-the-5-biggest-operational-challenges/)
3. [Ajgori Technologies — Travel Agency Software: A Feature Checklist for Buyers](https://ajgoritech.com/blog/travel-agency-software-features)
4. [Acquaint Softtech — How to Build an OTA: Flight, Hotel & Package Architecture](https://acquaintsoft.com/blog/how-to-build-online-travel-agency-architecture)
5. [Bókun — Operator Product Pages](https://www.bokun.io/manage)
6. [Google Business Profile — Improve Local Ranking](https://support.google.com/business/answer/7091)

---

*Document generated by AI research agent based on Travora codebase analysis and web research. All architecture decisions must comply with `backend/TRAVORA_BACKEND_RULES.md` and `frontend/TRAVORA_FRONTEND_RULES.md`.*