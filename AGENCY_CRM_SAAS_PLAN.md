# Travora — Full-Fledged Travel Agency CRM SaaS Plan

> **Product:** Travora — Travel Agency CRM SaaS Platform  
> **Status:** Planning — Production-Ready Blueprint  
> **Date:** November 2026  
> **Author:** AI Research Agent (Cline)  
> **Scope:** Complete agency CRM SaaS — lead-to-booking workflow, invoicing, itinerary builder, supplier management, automation, multi-tenant SaaS billing  
> **Relationship to existing docs:** Builds on `AGENCY_FEATURES_RESEARCH_AND_PLAN.md`, `AGENCY_MVP_IMPLEMENTATION_PLAN.md`, `AGENCY_IMPLEMENTATION_GAP_ANALYSIS_AND_PLAN.md`, `TRAVELLER_FEATURE_PLAN.md`, `TRAVELLER_MVP_IMPLEMENTATION_PLAN.md`  
> **Governance:** Must comply with `backend/TRAVORA_BACKEND_RULES.md` and `frontend/TRAVORA_FRONTEND_RULES.md`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Missing Pieces Analysis — What a Full CRM Needs vs. What Exists](#2-missing-pieces-analysis)
3. [Complete Feature List — Organized by Category](#3-complete-feature-list)
4. [SaaS Business Model & Monetization](#4-saas-business-model--monetization)
5. [Multi-Tenant Architecture & Security](#5-multi-tenant-architecture--security)
6. [Database Schema Design — New Modules](#6-database-schema-design)
7. [API Contract Design](#7-api-contract-design)
8. [Frontend Pages & Components](#8-frontend-pages--components)
9. [Implementation Roadmap — Phased, Production-Ready](#9-implementation-roadmap)
10. [Security, Compliance & Data Retention](#10-security-compliance--data-retention)
11. [Release Checklist & Definition of Done](#11-release-checklist)
12. [References](#12-references)

---

## 1. Executive Summary

### Vision

Transform Travora from a lead-generation marketplace (agency profile + packages + inquiries) into a **full-fledged Travel Agency CRM SaaS** that agency owners can run their entire daily operations on. The product must cover the day-to-day life of an agency owner:

1. **Capture & convert leads** (from website, ads, walk-ins, referrals)
2. **Build itineraries & quotes** (day-wise, priced, PDF-ready, shareable)
3. **Manage bookings & payments** (deposits, instalments, invoices, outstanding)
4. **Coordinate suppliers & operations** (hotels, transports, guides, vouchers)
5. **Track team performance** (pipeline, follow-ups, tasks, commissions)
6. **Measure business health** (reports, analytics, KPIs)

### Why agencies will buy this

Travel agencies today run on Excel, WhatsApp, email, and paper. A travel-specific CRM saves them time, reduces lost leads, and looks professional to customers. The differentiators vs. generic CRMs (HubSpot, Zoho, Salesforce):

- Travel-specific data models (departure dates, traveller counts, itineraries, packages)
- Day-wise itinerary builder with pricing/costing
- GST-compliant invoicing (India) / tax-aware invoicing (global)
- WhatsApp Business API integration (primary channel in emerging markets)
- Supplier/vendor database (hotels, transporters, guides)
- Departure calendar & voucher generation
- Commission tracking for agents/sub-agents

### Business Model (SaaS)

| Tier | Price (monthly) | Target | Limits |
|------|----------------|--------|--------|
| Starter | $29 | Solo agent / small agency | 1 user, 500 leads, 20 packages, basic CRM |
| Growth | $79 | Growing agency | 5 users, 5,000 leads, unlimited packages, itinerary builder, invoicing |
| Professional | $149 | Established agency | 15 users, unlimited leads, WhatsApp API, supplier DB, commission tracking, advanced reports |
| Enterprise | Custom | DMC / corporate travel | Unlimited users, SLA, white-label, dedicated support, API access |

- 14-day free trial, no credit card
- Annual billing: 2 months free
- Transaction fee: 0% on leads; optional 1-2% on payments processed via platform (future phase)

## 2. Missing Pieces Analysis — What a Full CRM Needs vs. What Exists

### Current state (existing codebase)

| Area | Exists | Gap |
|------|--------|-----|
| Agency profile & approval | ✅ Complete | None critical |
| Packages (CRUD, images, status) | ✅ Complete | No itinerary builder, no pricing/costing breakdown |
| Leads/inquiries (inbox, status, notes) | ✅ Complete | No pipeline stages, no auto-assignment, no follow-up reminders, no lead source tracking, no bulk upload, no ad integration |
| Auth, roles, users | ✅ Complete | No agency sub-users/staff management, no granular permissions |
| Chat | ⚠️ Partial | Not linked to leads, no WhatsApp/email tracking |
| Dashboard | ✅ Basic | No revenue/pipeline/commission reports, no departure calendar |
| Public listing | ✅ Complete | No client portal for travelers |

### Missing pieces for a full-fledged CRM (the build list)

| # | Missing Feature | Category | Why agencies need it daily |
|---|----------------|----------|---------------------------|
| 1 | Itinerary Builder (day-wise, hotels/flights/sightseeing, pricing) | Product | Core sales artifact; agencies send this to every customer |
| 2 | Quotation/Proposal Management (PDF, web link, multiple designs) | Sales | Commercial discussion needs a professional, trackable document |
| 3 | Booking Management (status, departure calendar, traveller roster) | Operations | Track confirmed trips, who is traveling when |
| 4 | Invoicing & Payments (tax invoices, payment links, instalments, outstanding) | Money | Know who owes money; collect deposits/balance online |
| 5 | Supplier/Vendor Database (hotels, transports, guides, rates) | Operations | Book ground arrangements; store contacts & rates |
| 6 | WhatsApp Business API Integration | Communication | Primary customer channel in most markets |
| 7 | Email Communication Tracking | Communication | Centralized customer communication history |
| 8 | Pipeline Stages & Kanban | Sales | Visualize where every enquiry stands; act on hot leads |
| 9 | Follow-up Reminders & Activity Timeline | Sales | Bookings are won/lost in follow-up; never forget a lead |
| 10 | Lead Capture Integrations (Meta/Google Lead Ads, webhook, bulk upload) | Marketing | Stop manual copy-paste; leads flow in automatically |
| 11 | Auto-assignment (round-robin, by source) | Sales | Fair, immediate lead distribution to staff |
| 12 | Task Management | Team | Coordinate team tasks per lead/booking |
| 13 | Document Management (vouchers, contracts, passports) | Operations | Store and retrieve customer/trip documents |
| 14 | Commission Tracking | Money | Pay agents/sub-agents accurately |
| 15 | Advanced Reporting & Analytics (lead source, conversion, revenue, outstanding) | Insights | Manage the business by numbers |
| 16 | Client Portal (traveler view of their bookings, documents, payments) | Customer experience | Professional traveler experience; reduce support calls |
| 17 | AI Features (itinerary generation, follow-up drafting) | Productivity | Save time; competitive differentiator |
| 18 | Multi-tenant SaaS Billing (subscription plans, usage metering, invoicing) | SaaS ops | Sell the platform; manage agency subscriptions |
| 19 | Agency Staff/Sub-user Management | Security | Agency owner controls staff access |
| 20 | Mobile-Responsive / PWA | Accessibility | Agents work from the field |


## 3. Complete Feature List — Organized by Category

### Category A: Lead & Pipeline Management (Sales Core)

**A1. Lead Management**
- Create, read, update, delete leads
- Lead fields: name, email, phone, source, destination, travel dates, traveller count, budget, message, status, assigned staff, agency notes, estimated value, probability %
- Lead sources: website, Facebook Ads, Google Ads, walk-in, referral, phone, WhatsApp, bulk import, other

**A2. Pipeline & Kanban**
- Customizable pipeline stages (default: New → Follow Up → Quotation Sent → Negotiation → Booking Confirmed → Completed → Lost → Dropped)
- Kanban board view with drag-and-drop stage changes
- Stage probability weighting for revenue forecasting

**A3. Lead Capture & Assignment**
- Web form embedding (public agency lead form)
- Facebook Lead Ads integration (webhook)
- Google Ads lead form integration (webhook)
- Bulk lead upload (CSV/Excel)
- Auto-assignment: round-robin, by source, by staff workload, manual
- Lead deduplication (by phone/email)

**A4. Follow-up & Activity**
- Follow-up reminders with date/time + staff assignee
- Follow-up calendar view (daily/weekly/monthly)
- Activity timeline per lead (calls, emails, WhatsApp, status changes, notes, documents)
- Overdue follow-up alerts/dashboard widget

**A5. Lead Source Tracking**
- Source performance report (leads by source, conversion by source, cost per lead if ad spend tracked)
- UTM parameter capture


### Category B: Itinerary & Quotation (Sales Product)

**B1. Day-wise Itinerary Builder**
- Create itineraries with day-by-day structure
- Per day: title, description, accommodation, meals, transport, sightseeing, highlights, distance/duration
- Attach images per day
- Itinerary templates (library) + AI-generated draft itineraries
- Copy existing itinerary to new lead

**B2. Pricing & Costing**
- Per-person and total pricing
- Cost breakdown (agency cost vs. sell price) → margin calculation
- Tax configuration (inclusive/exclusive/none, tax percentage)
- Advance payment percentage, balance due days
- Discount support (fixed or percent)

**B3. Quotation/Proposal**
- Generate quotation from itinerary + pricing
- Multiple PDF designs/templates
- Shareable public web link (no login required for customer)
- Quotation status: draft, sent, viewed, accepted, expired, converted-to-booking
- Quotation expiry date
- Convert accepted quotation directly to booking


### Category C: Booking & Operations

**C1. Booking Management**
- Convert lead/quotation to booking
- Booking fields: traveller roster (names, passport, DOB, gender), travel dates, package, itinerary, total price, paid amount, balance, status
- Booking statuses: enquiry → quoted → deposit paid → confirmed → completed → cancelled → refunded
- Departure calendar: view all departures by week/month, filter by staff/agency
- Booking voucher generation (traveller names, hotel details, pickup times, emergency contacts)

**C2. Document Management**
- Upload/store documents per booking/lead (passport copies, contracts, vouchers, insurance)
- Document categories, expiry tracking (visa/passport expiry alerts)
- Secure download links

### Category D: Invoicing & Payments (Money)

**D1. Invoicing**
- GST-compliant tax invoices (GSTIN field, auto-calc tax) — India
- Tax-aware invoices for other regions (VAT, sales tax)
- Invoice types: proforma, tax invoice, receipt
- Invoice numbering series, PDF generation, email/WhatsApp delivery
- Payment status: unpaid, partial, paid, overdue

**D2. Payment Collection**
- Payment links (Razorpay/Cashfree/Stripe) sent via WhatsApp/email
- Record manual payments (cash, bank transfer, cheque)
- Instalment/payment schedule (e.g., 50% now, 50% before departure)
- Payment ledger & outstanding report (who owes, how much, since when)
- Refund tracking

**D3. Commission Tracking**
- Staff/agent commission rules (flat or % of booking value)
- Commission payout tracking (pending, paid)
- Sub-agent/partner commission (B2B)


### Category E: Supplier & Vendor Management (Operations)

**E1. Supplier Database**
- Suppliers: hotels, transporters, airlines, guides, activity operators
- Fields: name, category, contact person, phone, email, address, GSTIN, rating, notes
- Rate cards (seasonal pricing, per-room/per-vehicle rates)
- Contract documents storage

**E2. Supplier Booking**
- Link bookings to suppliers (hotel booking for dates, transport booking)
- Supplier confirmations & reference numbers

### Category F: Communication

**F1. WhatsApp Business API**
- Send itineraries, quotes, payment links, reminders via WhatsApp
- Inbound message webhook → log as activity
- WhatsApp template messages (approved templates)
- Conversation history per lead/customer

**F2. Email**
- Send quotes, invoices, vouchers via email
- Email tracking (opened, clicked) — optional phase 2
- Email templates library

**F3. Call Logging**
- Log calls (inbound/outbound), duration, outcome, notes
- Click-to-dial (future phase with telephony provider)

### Category G: Team & Staff Management

**G1. Agency Staff / Sub-users**
- Invite staff (sales, operations, accounts)
- Roles: admin, sales, operations, accounts, viewer
- Granular permissions per module (leads, bookings, invoices, suppliers, reports)
- Staff performance report (leads handled, conversions, revenue)

**G2. Task Management**
- Create tasks linked to lead/booking/staff
- Task status: open, in progress, completed, overdue
- Task reminders

### Category H: Reporting & Analytics (Insights)

**H1. Operational Dashboards**
- Leads by status, by source, by staff
- Conversion funnel (lead → quote → booking → completed)
- Revenue: booked, collected, outstanding, forecast
- Departures this week/month
- Overdue follow-ups, pending payments

**H2. Reports (exportable PDF/CSV)**
- Lead source report
- Sales performance by staff
- Revenue & collection report
- Outstanding payments report
- Booking/departure report
- Commission report
- Supplier performance (optional)

### Category I: Client Portal (Traveler Experience)

**I1. Traveler Portal**
- Traveler login to view their bookings, itineraries, invoices, payment status
- Download vouchers, documents
- Request changes / contact agency
- Trip documents checklist (passport, visa, vaccines)


## 4. SaaS Business Model & Monetization

### Pricing tiers (monthly, per agency)

| Feature | Starter $29 | Growth $79 | Professional $149 | Enterprise Custom |
|---------|:-----------:|:----------:|:-----------------:|:-----------------:|
| Users | 1 | 5 | 15 | Unlimited |
| Leads | 500 | 5,000 | Unlimited | Unlimited |
| Packages | 20 | Unlimited | Unlimited | Unlimited |
| Itinerary builder | ❌ | ✅ | ✅ | ✅ |
| Quotations/PDF | ❌ | ✅ | ✅ | ✅ |
| Invoicing | ❌ | ✅ | ✅ | ✅ |
| Payment links | ❌ | ❌ | ✅ | ✅ |
| WhatsApp API | ❌ | ❌ | ✅ | ✅ |
| Supplier DB | ❌ | ❌ | ✅ | ✅ |
| Commission tracking | ❌ | ❌ | ✅ | ✅ |
| Advanced reports | Basic | ✅ | ✅ | ✅ |
| Staff management | ❌ | ✅ | ✅ | ✅ |
| Client portal | ❌ | ❌ | ✅ | ✅ |
| AI itinerary | ❌ | ❌ | ❌ | ✅ |
| SLA / priority support | ❌ | ❌ | ❌ | ✅ |

### Monetization mechanics
- Subscription via Stripe/Razorpay (integrated in SaaS billing module)
- Usage metering: leads stored, users, storage GB
- Overage billing or auto-upgrade prompts
- 14-day free trial
- Annual discount: 17% off (2 months free)

## 5. Multi-Tenant Architecture & Security

### Tenant model
- Each agency = one tenant (`agencyId` on every row)
- Agency staff users belong to one agency
- Travellers are global users but linked to agency via leads/bookings
- Strict row-level authorization: `req.agencyId` enforced on every query

### Security controls
- JWT authentication with role claims
- Role-based access control (RBAC) at agency level
- Resource ownership checks (staff can only see their agency's data)
- Rate limiting per agency + per IP
- PII minimization: no sensitive data in logs, encrypted storage for documents
- Audit log: who changed what, when (lead status, booking, invoice)

### Data isolation
- MongoDB with `agencyId` indexed on all tenant-scoped collections
- Application-level filtering (never rely on client-provided agencyId)
- Super-admin role for platform management (separate from agency staff)


## 6. Database Schema Design — New Modules

All new schemas follow existing patterns: `mongoose`, `timestamps: true`, `Types.ObjectId`, `agencyId` index, soft-delete via `deletedAt` or `status`.

### 6.1 `LeadPipeline` — pipeline stage definitions per agency

```ts
export interface LeadPipelineDocument extends Document {
  agencyId: Types.ObjectId;
  name: string;              // e.g. "Quotation Sent"
  order: number;             // kanban column order
  probability: number;       // 0-100, for revenue forecast
  color: string;             // UI color
  isDefault: boolean;
  isClosedWon: boolean;
  isClosedLost: boolean;
}
```

### 6.2 `LeadSource` — lead source tracking

```ts
export interface LeadSourceDocument extends Document {
  agencyId: Types.ObjectId;
  name: string;              // Facebook Ads, Google Ads, Website, Walk-in, Referral, WhatsApp, Phone, Other
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  costPerLead?: number;      // optional, for ROI
  isActive: boolean;
}
```

### 6.3 `Lead` — extended (extends existing)

Extend existing `LeadDocument` with:
- `pipelineStageId: Types.ObjectId` (ref LeadPipeline)
- `leadSourceId: Types.ObjectId` (ref LeadSource)
- `assignedStaffId: Types.ObjectId` (ref User)
- `estimatedValue: number`
- `probability: number` (0-100)
- `expectedCloseDate?: Date`
- `lastFollowUpAt?: Date`
- `nextFollowUpAt?: Date`
- `utmSource/utmMedium/utmCampaign?: string`
- `leadFormSubmissionId?: string` (external ad platform ID)

### 6.4 `LeadActivity` — activity timeline

```ts
export interface LeadActivityDocument extends Document {
  agencyId: Types.ObjectId;
  leadId: Types.ObjectId;
  staffId?: Types.ObjectId;            // who performed
  type: 'call' | 'email' | 'whatsapp' | 'note' | 'status_change' | 'document' | 'task';
  subject: string;
  description?: string;
  metadata?: Record<string, unknown>;  // e.g. call duration, email subject
  createdAt: Date;
}
```

### 6.5 `FollowUpReminder`

```ts
export interface FollowUpReminderDocument extends Document {
  agencyId: Types.ObjectId;
  leadId: Types.ObjectId;
  staffId: Types.ObjectId;
  reminderAt: Date;
  title: string;
  notes?: string;
  isCompleted: boolean;
  completedAt?: Date;
  channel: 'phone' | 'email' | 'whatsapp' | 'meeting';
}


### 6.6 `Itinerary`

```ts
export interface ItineraryDocument extends Document {
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  packageId?: Types.ObjectId;
  name: string;
  destination: string;
  durationDays: number;
  durationNights: number;
  days: ItineraryDay[];                // embedded array
  totalPrice: number;
  currency: string;
  taxType: 'inclusive' | 'exclusive' | 'none';
  taxPercentage: number;
  advancePercentage: number;
  isTemplate: boolean;
  templateCategory?: string;
  aiGenerated: boolean;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description?: string;
  accommodation?: string;
  meals?: string[];
  transport?: string;
  sightseeing?: string[];
  highlights?: string[];
  distance?: string;
  images?: { url: string; key: string; altText?: string }[];
}
```

### 6.7 `Quotation`

```ts
export interface QuotationDocument extends Document {
  agencyId: Types.ObjectId;
  leadId: Types.ObjectId;
  itineraryId?: Types.ObjectId;
  quotationNumber: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'expired' | 'converted';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  validUntil: Date;
  pdfUrl?: string;
  pdfKey?: string;
  publicShareLink: string;             // unguessable token URL
  shareLinkExpiresAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  notes?: string;
  termsAndConditions?: string;
}
```

### 6.8 `Booking`

```ts
export interface BookingDocument extends Document {
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  quotationId?: Types.ObjectId;
  bookingNumber: string;
  travellerId?: Types.ObjectId;        // primary traveller (User)
  travellers: TravellerRoster[];       // names, passport, DOB, gender
  packageId?: Types.ObjectId;
  itineraryId?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: 'enquiry' | 'quoted' | 'deposit_paid' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
  totalPrice: number;
  paidAmount: number;
  currency: string;
  departureDate: Date;
  staffId?: Types.ObjectId;
  supplierBookings?: SupplierBooking[]; // hotel/transport confirmations
  voucherUrl?: string;
  voucherKey?: string;
}

export interface TravellerRoster {
  name: string;
  passportNumber?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
}
```

### 6.9 `BookingPayment` / payment schedule

```ts
export interface BookingPaymentDocument extends Document {
  agencyId: Types.ObjectId;
  bookingId: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  amount: number;
  currency: string;
  method: 'cash' | 'bank_transfer' | 'cheque' | 'online_link' | 'razorpay' | 'stripe';
  transactionId?: string;
  paidAt: Date;
  notes?: string;
  recordedBy: Types.ObjectId;
}
```

### 6.10 `Invoice`

```ts
export interface InvoiceDocument extends Document {
  agencyId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  leadId?: Types.ObjectId;
  invoiceNumber: string;
  type: 'proforma' | 'tax_invoice' | 'receipt';
  status: 'unpaid' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  gstin?: string;                      // GST invoice (India)
  taxPercentage: number;
  dueDate?: Date;
  paidAmount: number;
  pdfUrl?: string;
  pdfKey?: string;
  paymentLinkUrl?: string;
  paymentLinkExpiresAt?: Date;
  notes?: string;
  termsAndConditions?: string;
}


### 6.11 `Supplier`

```ts
export interface SupplierDocument extends Document {
  agencyId: Types.ObjectId;
  name: string;
  category: 'hotel' | 'transport' | 'airline' | 'guide' | 'activity' | 'insurance' | 'other';
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  rating?: number;                     // 1-5
  notes?: string;
  isActive: boolean;
}

export interface SupplierRateCardDocument extends Document {
  supplierId: Types.ObjectId;
  itemName: string;
  seasonStart?: Date;
  seasonEnd?: Date;
  price: number;
  currency: string;
  unit: string;                        // per night, per seat, per day
  minQuantity?: number;
  notes?: string;
}
```

### 6.12 `SupplierBooking`

```ts
export interface SupplierBookingDocument extends Document {
  agencyId: Types.ObjectId;
  supplierId: Types.ObjectId;
  bookingId?: Types.ObjectId;          // traveller booking this supplier service is for
  referenceNumber?: string;            // supplier confirmation ref
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  rooms?: number;
  totalCost: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  documentUrl?: string;                // supplier voucher
}
```

### 6.13 `Document` (file storage)

```ts
export interface DocumentFileDocument extends Document {
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  category: 'passport' | 'contract' | 'voucher' | 'itinerary' | 'quote' | 'invoice' | 'other';
  fileName: string;
  url: string;
  key: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: Types.ObjectId;
  expiresAt?: Date;                    // e.g. visa expiry
}
```

### 6.14 `Task`

```ts
export interface TaskDocument extends Document {
  agencyId: Types.ObjectId;
  title: string;
  description?: string;
  staffId: Types.ObjectId;             // assignee
  createdBy: Types.ObjectId;
  leadId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  dueDate?: Date;
  status: 'open' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}
```

### 6.15 Communication log (WhatsApp / Email / Call)

```ts
export interface CommunicationLogDocument extends Document {
  agencyId: Types.ObjectId;
  leadId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  channel: 'whatsapp' | 'email' | 'call';
  direction: 'inbound' | 'outbound';
  contact: string;                     // phone or email
  subject?: string;
  body?: string;
  templateId?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
  messageId?: string;                  // provider message id
  sentAt: Date;
}
```

### 6.16 SaaS Billing modules

```ts
// SubscriptionPlan
export interface SubscriptionPlanDocument extends Document {
  name: string;                        // Starter, Growth, Professional
  priceMonthly: number;
  priceYearly: number;
  limits: { users: number; leads: number; storageGB: number };
  features: string[];                  // feature flags
  isActive: boolean;
}

// AgencySubscription
export interface AgencySubscriptionDocument extends Document {
  agencyId: Types.ObjectId;
  planId: Types.ObjectId;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  usage: { leadsThisPeriod: number; users: number; storageGB: number };
}

// PlatformInvoice (platform invoice to agency) — separate from customer Invoice
export interface PlatformInvoiceDocument extends Document {
  agencyId: Types.ObjectId;
  stripeInvoiceId?: string;
  amount: number;
  status: 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: Date;
  paidAt?: Date;
}
```

### Indexes (production performance)
- `Lead`: `{agencyId:1, pipelineStageId:1}`, `{agencyId:1, assignedStaffId:1}`, `{agencyId:1, nextFollowUpAt:1}`, `{agencyId:1, createdAt:-1}`
- `Booking`: `{agencyId:1, departureDate:1}`, `{agencyId:1, status:1}`
- `Invoice`: `{agencyId:1, status:1}`, `{agencyId:1, dueDate:1}`
- `Itinerary`: `{agencyId:1, isTemplate:1}`
- `Supplier`: `{agencyId:1, category:1}`
- `Task`: `{agencyId:1, staffId:1, status:1}`, `{agencyId:1, dueDate:1}`
- `FollowUpReminder`: `{agencyId:1, staffId:1, isCompleted:1}`, `{reminderAt:1}` (global ticker)
- `LeadActivity`: `{leadId:1, createdAt:-1}`
- `CommunicationLog`: `{agencyId:1, leadId:1}`, `{agencyId:1, sentAt:-1}`


## 7. API Contract Design

All endpoints under `/api/v1`. Prefix agency-scoped routes with `/agency`. Use existing response format:

```json
// Success
{ "success": true, "data": {}, "meta": {} }

// Error
{ "success": false, "error": { "code": "...", "message": "...", "details": {} } }
```

### 7.1 Lead Management

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/agency/leads` | Create lead | agency staff |
| GET | `/agency/leads` | List leads (filters, pagination, kanban) | agency staff |
| GET | `/agency/leads/:id` | Lead detail + activity timeline | agency staff |
| PATCH | `/agency/leads/:id` | Update lead | agency staff |
| DELETE | `/agency/leads/:id` | Soft-delete lead | agency admin |
| POST | `/agency/leads/bulk-import` | CSV/Excel import | agency admin |
| POST | `/agency/leads/webhook/meta` | Facebook Lead Ads webhook | public (signed) |
| POST | `/agency/leads/webhook/google` | Google Ads lead form webhook | public (signed) |
| GET | `/agency/leads/sources` | List lead sources | agency staff |
| POST | `/agency/leads/sources` | Create lead source | agency admin |
| GET | `/agency/leads/pipeline` | List pipeline stages | agency staff |
| POST | `/agency/leads/pipeline` | Create/update pipeline stage | agency admin |
| POST | `/agency/leads/:id/activities` | Add activity note | agency staff |
| GET | `/agency/leads/:id/activities` | Activity timeline | agency staff |
| POST | `/agency/leads/:id/followups` | Create follow-up reminder | agency staff |
| GET | `/agency/followups` | My follow-ups (today/overdue) | agency staff |
| GET | `/agency/dashboard/leads` | Lead metrics (by status, source, staff) | agency staff |

### 7.2 Itinerary & Quotation

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/agency/itineraries` | Create itinerary | agency staff |
| GET | `/agency/itineraries` | List itineraries | agency staff |
| GET | `/agency/itineraries/:id` | Itinerary detail | agency staff |
| PATCH | `/agency/itineraries/:id` | Update itinerary | agency staff |
| POST | `/agency/itineraries/:id/duplicate` | Duplicate itinerary | agency staff |
| POST | `/agency/itineraries/ai-generate` | AI draft itinerary | agency staff |
| GET | `/agency/itineraries/templates` | Template library | agency staff |
| POST | `/agency/quotations` | Create quotation from itinerary | agency staff |
| GET | `/agency/quotations` | List quotations | agency staff |
| GET | `/agency/quotations/:id` | Quotation detail + PDF | agency staff |
| PATCH | `/agency/quotations/:id` | Update quotation | agency staff |
| POST | `/agency/quotations/:id/send` | Send via email/WhatsApp | agency staff |
| GET | `/quotations/public/:shareToken` | Public share link (customer view) | public |
| POST | `/quotations/public/:shareToken/accept` | Accept quotation | public |

### 7.3 Booking & Operations

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/agency/bookings` | Create booking | agency staff |
| GET | `/agency/bookings` | List bookings (filters, pagination) | agency staff |
| GET | `/agency/bookings/:id` | Booking detail + travellers | agency staff |
| PATCH | `/agency/bookings/:id` | Update booking | agency staff |
| POST | `/agency/bookings/:id/status` | Change booking status | agency staff |
| GET | `/agency/bookings/departure-calendar` | Departures by week/month | agency staff |
| POST | `/agency/bookings/:id/voucher` | Generate voucher PDF | agency staff |
| GET | `/agency/bookings/:id/voucher` | Download voucher | agency staff |
| POST | `/agency/suppliers` | Create supplier | agency staff |
| GET | `/agency/suppliers` | List suppliers | agency staff |
| POST | `/agency/suppliers/:id/rates` | Add rate card | agency staff |
| POST | `/agency/suppliers/bookings` | Record supplier booking | agency staff |

### 7.4 Invoicing & Payments

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/agency/invoices` | Create invoice | agency staff/accounts |
| GET | `/agency/invoices` | List invoices | agency staff |
| GET | `/agency/invoices/:id` | Invoice detail + PDF | agency staff |
| PATCH | `/agency/invoices/:id` | Update invoice | agency staff |
| POST | `/agency/invoices/:id/payment-link` | Generate payment link | agency staff |
| POST | `/agency/invoices/:id/payments` | Record payment | agency accounts |
| GET | `/agency/invoices/outstanding` | Outstanding report | agency accounts |
| GET | `/agency/payments/ledger` | Payment ledger | agency accounts |
| POST | `/agency/commissions` | Commission rule | agency admin |
| GET | `/agency/commissions` | Commission report | agency admin |
| POST | `/agency/commissions/payouts` | Record payout | agency admin |


### 7.5 Communication

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/agency/communications/whatsapp/send` | Send WhatsApp message | agency staff |
| POST | `/agency/communications/whatsapp/webhook` | WhatsApp inbound webhook | public (signed) |
| POST | `/agency/communications/email/send` | Send email | agency staff |
| GET | `/agency/communications` | Communication log | agency staff |
| POST | `/agency/communications/calls` | Log call | agency staff |

### 7.6 Documents

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/agency/documents/upload` | Upload document | agency staff |
| GET | `/agency/documents` | List documents | agency staff |
| GET | `/agency/documents/:id/download` | Download document | agency staff |
| DELETE | `/agency/documents/:id` | Delete document | agency staff |

### 7.7 Tasks

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/agency/tasks` | Create task | agency staff |
| GET | `/agency/tasks` | List tasks (my/team) | agency staff |
| PATCH | `/agency/tasks/:id` | Update task status | agency staff |

### 7.8 Staff Management

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/agency/staff/invite` | Invite staff | agency admin |
| GET | `/agency/staff` | List staff | agency admin |
| PATCH | `/agency/staff/:id` | Update role/permissions | agency admin |
| DELETE | `/agency/staff/:id` | Remove staff | agency admin |
| GET | `/agency/permissions` | Available permissions | agency admin |

### 7.9 Reporting

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/agency/reports/leads-by-source` | Lead source report | agency staff |
| GET | `/agency/reports/conversion-funnel` | Conversion funnel | agency staff |
| GET | `/agency/reports/revenue` | Revenue & collection | agency accounts |
| GET | `/agency/reports/outstanding` | Outstanding payments | agency accounts |
| GET | `/agency/reports/staff-performance` | Staff performance | agency admin |
| GET | `/agency/reports/commission` | Commission report | agency admin |
| GET | `/agency/reports/export/:reportType` | CSV/PDF export | agency staff |

### 7.10 SaaS Billing (platform)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/saas/plans` | List subscription plans | public |
| POST | `/saas/subscribe` | Start subscription (trial) | agency owner |
| GET | `/saas/subscription` | My subscription | agency owner |
| POST | `/saas/billing-portal` | Stripe customer portal | agency owner |
| POST | `/saas/webhooks/stripe` | Stripe webhook | public (signed) |
| GET | `/saas/invoices` | Platform invoices | agency owner |
| GET | `/saas/usage` | Usage metering | agency owner |


## 8. Frontend Pages & Components

Follow existing Next.js App Router structure under `(agency)` route group. Use shadcn/ui, existing design system, server components by default.

### Agency Shell Navigation (update `agency-shell.tsx`)

```
Dashboard          → /agency
Leads              → /agency/leads          (kanban + list)
  ├── Lead Detail  → /agency/leads/:id
Pipeline           → /agency/pipeline
Itineraries        → /agency/itineraries
  ├── Itinerary → /agency/itineraries/:id
Quotations         → /agency/quotations
  ├── Quotation  → /agency/quotations/:id
Bookings           → /agency/bookings
  ├── Booking    → /agency/bookings/:id
Departure Calendar → /agency/bookings/calendar
Invoices           → /agency/invoices
  ├── Invoice    → /agency/invoices/:id
Suppliers          → /agency/suppliers
Documents          → /agency/documents
Tasks              → /agency/tasks
Staff              → /agency/staff            (admin only)
Reports            → /agency/reports
Settings           → /agency/settings
Billing            → /agency/billing          (subscription)
```

### New frontend pages (under `src/app/(agency)/`)

1. `page.tsx` — Dashboard (enhanced: revenue, leads, departures, overdue follow-ups)
2. `leads/page.tsx` — Lead list + kanban toggle
3. `leads/[id]/page.tsx` — Lead detail (timeline, follow-ups, activities)
4. `leads/import/page.tsx` — Bulk import CSV
5. `pipeline/page.tsx` — Pipeline stage config
6. `itineraries/page.tsx` — Itinerary list
7. `itineraries/[id]/page.tsx` — Itinerary builder (day-wise editor)
8. `itineraries/ai/page.tsx` — AI itinerary generator
9. `quotations/page.tsx` — Quotation list
10. `quotations/[id]/page.tsx` — Quotation detail + PDF preview + send
11. `quotations/public/[token]/page.tsx` — Public customer quote view (no auth)
12. `bookings/page.tsx` — Booking list
13. `bookings/[id]/page.tsx` — Booking detail + travellers + payments
14. `bookings/calendar/page.tsx` — Departure calendar (full-calendar)
15. `invoices/page.tsx` — Invoice list
16. `invoices/[id]/page.tsx` — Invoice detail + PDF + payment link
17. `suppliers/page.tsx` — Supplier directory
18. `suppliers/[id]/page.tsx` — Supplier detail + rates
19. `documents/page.tsx` — Document library
20. `tasks/page.tsx` — Task board
21. `staff/page.tsx` — Staff management (admin)
22. `reports/page.tsx` — Reports hub with export
23. `settings/page.tsx` — Agency settings
24. `billing/page.tsx` — Subscription & billing

### Public pages (customer-facing, under `(public)`)

- `quotations/[token]/page.tsx` — Public quotation view
- `agency/[slug]/page.tsx` — Existing (enhance with lead form)

### Shared components (`src/features/agency/components/`)

- `LeadKanbanBoard.tsx` — Drag-and-drop pipeline
- `LeadCard.tsx`
- `FollowUpCalendar.tsx`
- `ActivityTimeline.tsx`
- `ItineraryDayEditor.tsx`
- `ItineraryPreview.tsx`
- `QuotationPDFPreview.tsx`
- `QuotationShareLink.tsx`
- `BookingTravellerRoster.tsx`
- `DepartureCalendar.tsx` (FullCalendar integration)
- `InvoicePDFPreview.tsx`
- `PaymentLinkSender.tsx`
- `SupplierCard.tsx`
- `DocumentUploader.tsx`
- `TaskBoard.tsx`
- `StaffRoleSelector.tsx`
- `ReportChart.tsx` (Recharts)
- `ExportButton.tsx` (CSV/PDF)
- `WhatsAppSender.tsx`
- `EmailSender.tsx`

### Public traveler portal (future, under `(customer)`)

- `bookings/page.tsx` — My bookings
- `bookings/[id]/page.tsx` — Booking detail + vouchers
- `invoices/page.tsx` — My invoices
- `documents/page.tsx` — My documents


## 9. Implementation Roadmap — Phased, Production-Ready

### Phase 1: Foundation — Lead Pipeline & Follow-ups (Weeks 1-3)
*Goal: Agency can manage leads end-to-end with pipeline stages and follow-ups.*

**Backend:**
- [ ] `LeadPipeline` model + service + controller + routes
- [ ] `LeadSource` model + CRUD
- [ ] Extend `Lead` with pipelineStage, leadSource, assignedStaff, estimatedValue, probability, follow-up dates
- [ ] `LeadActivity` model + CRUD
- [ ] `FollowUpReminder` model + service (due-date query)
- [ ] Lead bulk import (CSV parsing)
- [ ] Lead webhook endpoints (Meta, Google) with signature verification
- [ ] Auto-assignment logic (round-robin)
- [ ] Lead metrics aggregation for dashboard

**Frontend:**
- [ ] Lead list page with filters + pagination
- [ ] Lead Kanban board (drag-drop stage change)
- [ ] Lead detail page with activity timeline
- [ ] Follow-up reminders UI (today/overdue)
- [ ] Pipeline config page
- [ ] Lead source management
- [ ] Bulk import UI

**Exit criteria:** Agency owner can create leads, assign staff, move through pipeline, set follow-up reminders, see overdue items. Type-check, lint, build pass.

---

### Phase 2: Itinerary Builder & Quotations (Weeks 4-6)
*Goal: Agency builds day-wise itineraries and sends professional quotes.*

**Backend:**
- [ ] `Itinerary` model (days array, pricing, templates, AI flag)
- [ ] `Quotation` model (numbering, status, PDF, share token)
- [ ] Quotation PDF generation (existing storage + PDF lib)
- [ ] Public share link (unguessable token, expiry)
- [ ] Convert quotation → booking flow
- [ ] AI itinerary generation (integrate LLM via existing HTTP utils)

**Frontend:**
- [ ] Itinerary list page
- [ ] Day-wise itinerary builder (add/reorder days, images)
- [ ] Itinerary template library
- [ ] AI itinerary generator page
- [ ] Quotation list + detail
- [ ] Quotation PDF preview
- [ ] Send quotation (email/WhatsApp placeholder)
- [ ] Public quotation share page (customer view, no login)

**Exit criteria:** Agency creates an itinerary, generates a quotation, shares a public link, customer views it. PDF renders correctly.

---

### Phase 3: Bookings, Departures & Vouchers (Weeks 7-9)
*Goal: Agency converts quotes to bookings and manages departures.*

**Backend:**
- [ ] `Booking` model (traveller roster, status, dates)
- [ ] `BookingPayment` model
- [ ] Booking status transitions (enquiry→quoted→deposit_paid→confirmed→completed→cancelled)
- [ ] Departure calendar query (group by date)
- [ ] Voucher PDF generation
- [ ] Supplier booking linkage

**Frontend:**
- [ ] Booking list + detail
- [ ] Traveller roster editor (names, passport, DOB)
- [ ] Booking status transition UI
- [ ] Departure calendar (FullCalendar)
- [ ] Voucher preview/download

**Exit criteria:** Agency converts a quotation to a booking, adds travellers, marks deposit paid, generates a voucher, sees departure on calendar.

---

### Phase 4: Invoicing, Payments & Commissions (Weeks 10-12)
*Goal: Agency invoices customers, collects payments, tracks commissions.*

**Backend:**
- [ ] `Invoice` model (GST/tax, numbering, PDF, payment link)
- [ ] `Invoice` payment recording
- [ ] Outstanding report aggregation
- [ ] Payment ledger
- [ ] Commission rules + payout tracking
- [ ] Payment link integration (Stripe/Razorpay placeholder)

**Frontend:**
- [ ] Invoice list + detail
- [ ] Invoice PDF preview
- [ ] Payment link generation + send
- [ ] Record manual payment
- [ ] Outstanding report
- [ ] Payment ledger
- [ ] Commission report

**Exit criteria:** Agency creates an invoice, records partial payment, sees outstanding balance, generates commission report.

---

### Phase 5: Suppliers, Documents & Tasks (Weeks 13-15)
*Goal: Agency coordinates suppliers and team tasks.*

**Backend:**
- [ ] `Supplier` + `SupplierRateCard` models
- [ ] `SupplierBooking` model
- [ ] `DocumentFile` model (upload via existing Filebase storage)
- [ ] `Task` model + assignments
- [ ] Communication log (WhatsApp/Email/call) models
- [ ] WhatsApp webhook (placeholder for Business API)

**Frontend:**
- [ ] Supplier directory + detail + rate cards
- [ ] Supplier booking records
- [ ] Document library + upload + download
- [ ] Task board + my tasks
- [ ] Communication log view
- [ ] WhatsApp/email send modals

**Exit criteria:** Agency adds suppliers, records a supplier booking, uploads a passport copy, creates and completes a task.

---

### Phase 6: Staff Management, Reports & SaaS Billing (Weeks 16-20)
*Goal: Multi-tenant SaaS ready to sell to agencies.*

**Backend:**
- [ ] Agency staff/sub-user model + invites + RBAC permissions
- [ ] Granular permission middleware (per module/action)
- [ ] Report endpoints with CSV/PDF export
- [ ] `SubscriptionPlan`, `AgencySubscription`, `PlatformInvoice` models
- [ ] Stripe/Razorpay subscription integration
- [ ] Usage metering (leads, users, storage)
- [ ] Billing portal webhook
- [ ] Trial enforcement, plan limits enforcement

**Frontend:**
- [ ] Staff management (invite, role, remove)
- [ ] Reports hub (charts + export)
- [ ] Billing page (plan selection, subscription status, invoices)
- [ ] Usage metering display
- [ ] Permission UI (checkbox matrix)

**Exit criteria:** New agency signs up, gets 14-day trial, subscribes, adds staff with roles, hits plan limits, upgrades. Multi-tenant isolation verified.

---

### Phase 7: Client Portal & AI Polish (Weeks 21-24)
*Goal: Traveler-facing portal and AI features.*

**Backend:**
- [ ] Traveler booking/invoice/document read endpoints (authenticated customer)
- [ ] AI itinerary generation (full integration)
- [ ] AI follow-up drafting

**Frontend:**
- [ ] Customer portal (login, my bookings, invoices, vouchers, documents)
- [ ] AI itinerary generator UI
- [ ] AI follow-up suggestion UI

**Exit criteria:** Traveler logs in, views booking, downloads voucher, pays invoice online.


## 10. Security, Compliance & Data Retention

| Area | Requirement | Implementation |
|------|-------------|----------------|
| Multi-tenant isolation | Agency staff never see another agency's data | `agencyId` enforced in every service query; middleware injects `req.agencyId` |
| Authentication | JWT + role claims | Existing auth middleware; refresh token rotation |
| Authorization | RBAC per module/action | Permission middleware checks `staff.role.permissions` |
| PII protection | No sensitive data in logs | Pino logger sanitizes email/phone/passport; documents stored separately |
| Document security | Signed URLs, time-limited | Filebase presigned URLs with expiry; access checked against agency |
| Rate limiting | Per agency + per IP | express-rate-limit with agency key |
| Input validation | Zod on all endpoints | Existing validation middleware pattern |
| Audit log | Who changed what | `createdBy`/`updatedBy` on all mutable docs; optional `AuditLog` collection |
| Data retention | Configurable per agency | Retention policy: leads 3 years, documents 7 years, communications 2 years (configurable) |
| GDPR/CCPA | Right to erasure | Account deletion cascade: anonymize lead PII, delete documents, keep aggregated stats |
| TLS | HTTPS everywhere | Platform enforces TLS; HSTS header via Helmet |
| Webhook security | Signature verification | Meta/Google/Stripe webhooks verified with shared secret |

### Data retention defaults
- Leads: 3 years from last activity, then anonymize (keep name → "Lead #XXXX")
- Communications: 2 years
- Documents: 7 years (tax/invoice), or per country law
- Invoices: 7 years (tax requirement)
- Inactive agencies: subscription suspended, data retained 90 days, then deletion notice


## 11. Release Checklist & Definition of Done

### Per-feature DoD (backend)
- [ ] Functionality works per API contract
- [ ] TypeScript passes (`tsc --noEmit`)
- [ ] ESLint passes
- [ ] Build passes
- [ ] Zod validation on all input
- [ ] Authorization enforced (agencyId + role)
- [ ] Sensitive data protected (no PII in logs)
- [ ] API response is intentional DTO (no raw DB docs)
- [ ] Errors handled centrally (AppError)
- [ ] Pagination where list endpoints
- [ ] Indexes defined for query performance
- [ ] No N+1 queries
- [ ] Rate limiting considered
- [ ] No raw secrets exposed
- [ ] Documentation updated

### Release checklists

**Phase 1 release:**
- [ ] Agency owner sees pipeline stages and kanban
- [ ] Lead creation validates source, staff assignment
- [ ] Follow-up reminders fire and show overdue
- [ ] Lead activity timeline shows calls/notes/status changes
- [ ] Bulk import works (CSV, 10-row test then 1000)
- [ ] Webhook endpoints verified (Meta/Google signatures)
- [ ] No cross-agency lead access

**Phase 2 release:**
- [ ] Itinerary builder creates day-wise trips with images
- [ ] Quotation generates from itinerary with correct tax/total
- [ ] PDF quotation renders and downloads
- [ ] Public share link works without login; expires correctly
- [ ] Quotation accepted → converts to booking draft

**Phase 3 release:**
- [ ] Booking status transitions enforced server-side
- [ ] Departure calendar shows correct bookings by date
- [ ] Traveller roster (names, passport) stored securely
- [ ] Voucher PDF generated and downloadable

**Phase 4 release:**
- [ ] Invoice with GST/tax calculates correctly
- [ ] Payment recording updates paidAmount and status
- [ ] Outstanding report shows unpaid invoices
- [ ] Payment link generated and sent
- [ ] Commission report accurate

**Phase 5 release:**
- [ ] Supplier directory + rate cards
- [ ] Document upload/download with access control
- [ ] Task creation, assignment, completion
- [ ] WhatsApp/email communication logged

**Phase 6 release (SaaS launch):**
- [ ] New agency signs up → 14-day trial
- [ ] Plan limits enforced (users, leads, storage)
- [ ] Stripe subscription creates + webhooks handled
- [ ] Staff invite + RBAC works
- [ ] Reports export CSV/PDF
- [ ] Multi-tenant isolation penetration test pass
- [ ] Production build, type-check, lint pass

**Phase 7 release:**
- [ ] Traveler portal login works
- [ ] Traveler sees own bookings, invoices, vouchers
- [ ] AI itinerary generation returns valid day-wise plan

### Global launch checklist
- [ ] Production environment configured (MongoDB, Filebase, Stripe)
- [ ] Environment variables validated (no secrets in code)
- [ ] Database indexes in production
- [ ] Rate limits tuned for production traffic
- [ ] Backup strategy for MongoDB (point-in-time recovery)
- [ ] Monitoring (uptime, error rate, slow queries)
- [ ] SSL/TLS certificates valid
- [ ] Terms of service, privacy policy, refund policy published
- [ ] GDPR data deletion request process documented
- [ ] Support contact (email) published


## 12. References

### Internal (codebase)
1. `backend/TRAVORA_BACKEND_RULES.md` — Backend engineering constitution (mandatory)
2. `backend/README.md` — Backend foundation, stack, architecture
3. `frontend/README.md` — Frontend foundation, stack, design system
4. `frontend/TRAVORA_FRONTEND_RULES.md` — Frontend engineering constitution
5. `AGENCY_FEATURES_RESEARCH_AND_PLAN.md` — Existing agency research
6. `AGENCY_MVP_IMPLEMENTATION_PLAN.md` — Existing agency MVP
7. `AGENCY_IMPLEMENTATION_GAP_ANALYSIS_AND_PLAN.md` — Gap analysis
8. `TRAVELLER_FEATURE_PLAN.md` — Traveller plan
9. `TRAVELLER_MVP_IMPLEMENTATION_PLAN.md` — Traveller MVP
10. `backend/src/modules/agencies/` — Agency module reference
11. `backend/src/modules/leads/` — Lead module reference
12. `backend/src/modules/packages/` — Package module reference
13. `backend/src/modules/users/` — User/Role module reference

### External (web research — feature sources)
1. [TravBizz — Travel CRM Features: 15 Must-Have Features for a Modern Travel Agency](https://www.travbizz.com/blog/travel-crm-features-for-modern-travel-agency)
2. [TripClap CRM — How to Choose a Travel CRM: 25-Point Checklist for 2026](https://www.tripclapcrm.com/blog/how-to-choose-travel-crm-checklist)
3. [TravelBoost — Travel Agency Management Software: 10 Powerful Features You Need in 2026](https://travelboost.app/blog/travel-agency-management-software)
4. [Bókun — Operator Product Pages](https://www.bokun.io/manage) — Reference for mature booking/availability
5. [Google Business Profile — Improve Local Ranking](https://support.google.com/business/answer/7091) — Trust/discovery practices

---

*End of `AGENCY_CRM_SAAS_PLAN.md`. This is a production-ready blueprint. All implementation must comply with `TRAVORA_BACKEND_RULES.md` and `TRAVORA_FRONTEND_RULES.md`. Do not deviate from the locked tech stack (Node.js, Express, TypeScript, MongoDB/Mongoose, REST `/api/v1`, Zod, Pino) without explicit project-owner approval.*

