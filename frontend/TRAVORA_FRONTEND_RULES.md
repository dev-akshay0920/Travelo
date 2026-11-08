# Travora Frontend Development Constitution

> **Governance document.** This is the single source of truth for every AI coding agent, developer, or automation tool working on the Travora frontend. It is intentionally long and strict so that no agent drifts off-track while working.

---

## 0. ABSOLUTE RULE

Before making any change to the Travora frontend, every AI agent or developer **MUST read and follow** `TRAVORA_FRONTEND_RULES.md`. These rules are mandatory unless the project owner explicitly instructs otherwise. Do **not** silently introduce a new architecture, design system, dependency, coding convention, or pattern that conflicts with this document.

If a requested implementation conflicts with these rules, **stop and identify the conflict before proceeding.**

This file is authoritative. It overrides any generic Next.js/React "best practice" suggestion that conflicts with it.

---

## 1. PROJECT IDENTITY

| Field            | Value                                                        |
|------------------|--------------------------------------------------------------|
| Product          | **Travora** — travel discovery & lead-generation platform   |
| Repository       | `travora-frontend` (this repository)                          |
| Application      | Travel & Tour Agency Platform                               |
| Current stage    | V1 MVP                                                       |
| Current model    | Lead generation                                              |
| Frontend         | Next.js (separate app)                                       |
| Backend          | Separate Express application                                 |
| Database         | MongoDB (backend-owned; **never assumed by the frontend**)   |

V1 is focused on **travel discovery and lead generation only**. The future product may expand into booking, payments, trip completion, reviews, and advanced analytics, but those future capabilities **must not** influence V1 toward unnecessary complexity.

---

## 2. ARCHITECTURAL PHILOSOPHY

Travora's frontend architecture is:

```text
Professional + Maintainable + Flexible + Performance-conscious
+ Accessible + Secure - Unnecessary complexity
```

The frontend uses a **feature-oriented architecture**. It must remain:

- medium complexity
- easy to understand
- easy for another developer to continue
- easy for AI agents to modify safely
- scalable without premature abstraction

**Avoid:**

- overengineering
- unnecessary design patterns
- giant global stores
- unnecessary providers
- excessive abstraction
- unnecessary dependencies
- duplicated components
- giant components
- feature logic inside global utilities

---

## 3. TECHNOLOGY STACK — LOCKED

The frontend stack is frozen. Do **not** replace these without explicit project-owner approval.

| Layer        | Technology                                  |
|--------------|---------------------------------------------|
| Core         | Next.js, React, TypeScript, App Router      |
| Styling      | Tailwind CSS                                |
| UI           | shadcn/ui                                   |
| Primitives   | Radix UI primitives                         |
| Icons        | Lucide React                                |
| Fonts        | Inter (via `next/font`)                     |
| Code quality | ESLint (strict), strict TypeScript          |
| Optional     | Prettier only if configured                 |

---

## 4. LICENSE POLICY

Travora follows an **MIT-first** dependency policy.

Preferred UI ecosystem (all MIT): `shadcn/ui`, Radix UI, Tailwind CSS, Lucide, Inter.

Before introducing **any** dependency, an agent must confirm it is actually necessary and that no existing capability solves the problem.

**Do NOT introduce** (without explicit approval):

- proprietary UI kits
- paid component libraries
- unnecessary UI frameworks
- duplicate libraries solving the same problem

---

## 5. PROJECT STRUCTURE

```text
src/
├── app/
│   ├── (public)/     # unauthenticated routes (landing, marketing)
│   ├── (auth)/       # future authentication routes
│   ├── (customer)/   # future customer-facing routes
│   ├── (agency)/     # future agency-facing routes
│   ├── (admin)/      # future admin routes
│   ├── layout.tsx          # root layout: font, metadata, global CSS
│   ├── globals.css         # centralized design tokens
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── components/
│   ├── ui/                 # shadcn/ui primitives (generic only)
│   ├── layout/             # shared layout chrome (header, footer)
│   ├── navigation/         # shared navigation
│   └── shared/             # genuinely cross-feature components
│
├── features/               # feature-oriented modules (filled incrementally)
│   ├── auth/
│   ├── agencies/
│   ├── packages/
│   ├── leads/
│   ├── chat/
│   ├── watchlist/
│   └── analytics/
│
├── lib/
│   ├── api/                # typed fetch client + errors
│   ├── constants/          # app-wide constants
│   └── utils.ts            # className helper
│
├── hooks/                  # shared hooks (only when genuinely reusable)
├── providers/              # global providers (only when genuinely needed)
├── types/                  # globally shared types
└── config/                 # site config + navigation
```

Do **not** blindly create every folder. Only create a folder when it has a meaningful purpose. Empty route groups and feature folders are scaffolding placeholders until their feature is implemented — never fill them with fake placeholder logic.

---

## 6. FOLDER RESPONSIBILITIES

- `app/` — routes, layouts, route groups, loading/error/not-found boundaries, page composition. **No complex business logic.**
- `components/ui/` — generic UI primitives via shadcn/ui only. Must **not** contain feature-specific business logic.
- `components/shared/` — genuinely reusable application components. Only place a component here if it is actually shared across multiple features.
- `components/layout/` — application layout chrome (header, footer, shell, sidebar).
- `features/<name>/` — feature-specific code (`components/`, `api/`, `hooks/`, `types/`, `utils/` as needed, **not** all upfront).
- `lib/` — infrastructure: API client, generic utilities, constants, auth helpers. **Not a dumping ground.**
- `hooks/` — only reusable hooks. Do not wrap a single line of code in a hook.
- `providers/` — only genuine global providers. Do not create providers unnecessarily.
- `types/` — only globally shared types. Feature-specific types stay in their feature.
- `config/` — `site.config.ts`, navigation config. **Never secrets.**

---

## 7. DEPENDENCY DIRECTION

```text
app  →  features  →  shared components / lib
```

Shared layers must **not** depend on feature-specific code. For example, `components/shared/` must **not** import from `features/packages/`. Keep dependencies one-way. Avoid circular imports.

---

## 8. CENTRALIZED THEME — MANDATORY

The design system is centralized. All colors are authored once as **semantic CSS variables** in `src/app/globals.css` and exposed to Tailwind via `@theme inline`. Components reference tokens — **never raw hex** — so the palette is rebranchable from one place.

Official starting brand palette:

```text
Primary        #0F4C5C
Primary Hover  #0B3D4A
Secondary      #0E7490
Accent         #F9735B

Background     #F8FAFC
Surface        #FFFFFF

Foreground     #0F172A
Muted          #64748B
Border         #E2E8F0
```

Components must use semantic tokens:

```text
bg-primary        text-primary         bg-background
bg-card           text-card-foreground text-foreground
text-muted-foreground  border-border   bg-surface (card)
```

**Do NOT** scatter raw hex repeatedly (`bg-[#0F4C5C]`, `text-[#64748B]`, `border-[#E2E8F0]`). If a color is part of the design system, define and use the semantic token.

---

## 9. COLOR USAGE

- **Primary (`#0F4C5C`)** — primary CTAs, important actions, brand elements, active states.
- **Secondary (`#0E7490`)** — secondary interactive elements, supporting brand.
- **Accent (`#F9735B`)** — use sparingly; draw attention to important travel actions/highlights. Do not make the whole UI accent-colored.
- **Neutrals** — backgrounds, surfaces, borders, text, muted info.

The application must feel calm and premium.

---

## 10. VISUAL DESIGN LANGUAGE

Travora should look: **modern, trustworthy, premium, friendly, clean, spacious, travel-oriented.**

**Avoid:** excessive gradients, excessive glassmorphism, excessive shadows, overly rounded interfaces, huge cards, excessive decorative elements, visually noisy pages, generic SaaS layouts.

**Prefer:** strong typography, whitespace, subtle borders, restrained shadows, clear hierarchy, consistent spacing, meaningful imagery, clear calls to action.

---

## 11. TYPOGRAPHY

Primary font: **Inter** (via `next/font`, `display: swap`). Use Next.js's recommended font-loading approach.

Typography hierarchy (use consistently):

```text
Display  →  H1  →  H2  →  H3  →  Body  →  Small  →  Caption
```

Do not randomly choose font sizes per component — reuse the existing system. `font-sans` and `font-heading` are configured in `globals.css`.

---

## 12. SHADCN/UI RULES

Use `shadcn/ui` as the base component system. Do **not** replace it with another UI framework.

- When a required component exists in shadcn, **prefer the shadcn implementation.** Do not rebuild an equivalent from scratch without reason.
- On customization: preserve accessibility, component consistency, and variant patterns. Avoid one-off styling hacks.
- Do not modify the underlying component system globally to solve a local problem.
- Only install the primitives actually needed; do not install the entire shadcn catalog.

---

## 13. COMPONENT RULES

Every component must have a clear, single responsibility. Avoid components that fetch unrelated data, span multiple business domains, contain huge conditional trees, or manage unrelated state.

Preferred flow:

```text
Page → Feature Component → Shared Component → UI Primitive
```

Keep components composable and small.

---

## 14. TYPESCRIPT RULES

TypeScript **must** remain strict (`"strict": true`). `strict` is already enabled in `tsconfig.json`.

**Mandatory:**
- explicit types, interfaces, discriminated unions
- typed props and typed API responses
- `unknown` for genuinely-unknown runtime data (never `any`)

**Do NOT use:**
- `any` (unless absolutely unavoidable and explicitly justified)
- `@ts-ignore`
- `@ts-nocheck`

Never silence type errors just to make a build pass. Fix the underlying problem.

Every change must pass: `npx tsc --noEmit`

---

## 15. ESLINT RULES

ESLint errors are unacceptable.

**Do not** add `eslint-disable` unless there is a legitimate, documented architectural reason. Never disable a rule simply because it is inconvenient.

If a lint error appears: understand it, fix the implementation, re-run lint. Never hide it.

---

## 16. SERVER COMPONENTS — DEFAULT

Next.js Server Components are the default.

**Do NOT** add `"use client"` unless the component requires:

- state
- event handlers
- browser APIs
- effects
- client-side interaction
- real-time behavior

Keep Client Components as small as possible. If one child needs interactivity, extract only that child into a Client Component — do **not** convert the whole page.

---

## 17. PERFORMANCE RULES

Always prefer:

- Server Components
- minimal client JavaScript
- efficient data fetching
- appropriate caching (Next.js fetch cache / `revalidate`)
- Next.js optimized fonts and images
- pagination for large lists
- minimal API payloads
- lazy loading where appropriate

**Avoid:**

- unnecessary re-renders
- unnecessary global state
- duplicate requests
- huge client bundles
- unnecessary dependencies
- premature memoization

Do not optimize blindly. Do not introduce Redis or complex caching infrastructure just because it sounds faster. Measure first.

---

## 18. API COMMUNICATION

The frontend communicates with a separate Express backend, never with MongoDB directly.

- All HTTP goes through the centralized client in `src/lib/api/client.ts` (`createApiClient`). Do **not** scatter `fetch()` calls across components.
- Base URL comes from `NEXT_PUBLIC_API_URL` (see `.env.example`). **Never** hard-code `http://localhost:5000` in components.
- Future endpoints: `/api/v1/...`.
- The frontend consumes **API contracts**, not raw backend objects. The backend is the authority for validation/authorization/shape.
- The current `createApiClient` targets the v1 base path and fails gracefully (typed `ApiError`) when the backend is not yet running — the V1 foundation does not require a backend to build or run.

---

## 19. FRONTEND SECURITY

Frontend validation exists for **user experience and early feedback only.** It is **not** security.

The backend remains the authority for: validation, authorization, authentication, sanitization, and sensitive-data protection.

**Never** place in frontend code: API secrets, private keys, database credentials, or server-only secrets.

**Never** expose sensitive values via `NEXT_PUBLIC_*`. Only non-sensitive runtime config may use the `NEXT_PUBLIC_` prefix (e.g., `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`).

Do not store sensitive authentication material casually in `localStorage`. The authentication-storage strategy is deferred and will be defined with the backend/authentication implementation. Server-only cookies are the expected direction.

---

## 20. DATA HANDLING

Never expose more data than a component needs. Do not bind UI to entire backend objects when only a few fields are required — use explicit data contracts and select only what is needed.

Avoid leaking: internal IDs when unnecessary, internal metadata, private agency information, administrative data, or other users' sensitive information. The backend performs final authorization and response filtering.

---

## 21. STATE MANAGEMENT

Do **not** introduce a global state library by default.

**Do NOT** install Redux, Zustand, or other state managers unless a real requirement appears (approved by the project owner).

Prefer:

- Server state → server-side data fetching (`fetch`, cache, `revalidate`)
- UI state → local component state
- Global state → only genuinely global concerns (e.g., an eventual auth session)

Do not create a giant global store.

---

## 22. DEPENDENCY RULE

Before adding any dependency, ask:

1. Do we actually need it?
2. Can React/Next.js solve this natively?
3. Can existing Travora utilities solve it?
4. Is the license acceptable (MIT-first)?
5. Is it maintained?
6. Does it add unnecessary complexity?
7. Will it add long-term maintenance cost?

If the answer is unclear, **do not install it** without project-owner approval. Check `package.json` before installing.

---

## 23. ACCESSIBILITY

Every feature must consider accessibility.

Requirements:

- semantic HTML
- keyboard navigation
- visible focus states (`focus-visible`)
- accessible labels for form controls
- accessible buttons (text labels, not icon-only without a label)
- accessible dialogs/popovers
- sufficient color contrast (do not rely on color alone)
- proper heading hierarchy

Prefer Radix/shadcn accessible primitives over hand-rolled interaction behavior. Use ARIA only when necessary.

---

## 24. RESPONSIVE DESIGN

Every UI feature must work across: **mobile, tablet, desktop, large desktop.** Use mobile-first Tailwind (`sm:`, `md:`, `lg:`, `xl:`).

Do not create wholly separate mobile/desktop component trees unless truly necessary.

---

## 25. ERROR HANDLING

User-facing error states must be clear and friendly.

**Do NOT** display: stack traces, raw backend errors, database errors, or internal implementation details.

Reuse the existing patterns: `ErrorState`, `EmptyState`, `LoadingState`/`Skeleton`, and the root `app/error.tsx` / `app/loading.tsx` / `app/not-found.tsx` boundaries.

---

## 26. LOADING STATES

Do not leave users with blank screens. For async UI, use loading states / skeletons and preserve layout stability. Use Next.js loading boundaries where appropriate. Avoid gratuitous spinners.

---

## 27. FILE NAMING

```text
Components : PascalCase names
Files      : kebab-case.tsx
Functions  : camelCase
Types      : PascalCase
Constants  : UPPER_SNAKE_CASE
```

Examples: `package-card.tsx`, `page-header.tsx`, `dashboard-shell.tsx`, `getPackages()`, `API_BASE_URL`.

---

## 28. IMPORTS

Use the `@/*` alias. Prefer:

```ts
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/navigation/main-nav";
import { siteConfig } from "@/config/site.config";
import { createApiClient } from "@/lib/api/client";
```

Avoid unnecessary deep relative imports. Avoid circular dependencies.

---

## 29. FEATURE ISOLATION

Feature-specific code belongs to its feature. A feature may contain `components/`, `api/`, `hooks/`, `types/`, `utils/` **when needed** — not all upfront.

Do **not** move feature-specific logic into global shared folders just because another file imports it once. Move something to a shared layer only when it is genuinely shared across features.

---

## 30. NO BUSINESS LOGIC IN UI PRIMITIVES

`components/ui/*` must **never** know about: agencies, packages, leads, customers, admins, bookings, chats, etc.

A Button must remain a Button. A Card must remain a Card. Business logic belongs in `features/` and `lib/`, never in `components/ui/`.

---

## 31. NO PREMATURE FEATURES

The current repository must **NOT** prematurely implement:

- booking
- payment
- reviews
- agency onboarding / registration flows
- lead-generation workflows
- chat
- analytics dashboards
- admin tooling

unless the current task explicitly requests them. A new feature may be implemented only inside the existing architecture — never by restructuring the whole project.

---

## 32. FUTURE FEATURE ROADMAP

The architecture exists to support future features in approximately this direction:

```text
Authentication → Agency Management → Package Management
→ Marketplace Discovery → Lead Generation → Chat → Analytics
→ (future) Booking → (future) Payment
```

Future booking/payment functionality must **not** make V1 needlessly complex.

---

## 33. AI AGENT WORKFLOW

Every AI agent must follow this before changing code:

1. **Read** `TRAVORA_FRONTEND_RULES.md`.
2. **Understand**: the feature requested, affected files, architecture layer, existing patterns, design-system requirements.
3. **Inspect**: search for an existing component/utility/dependency before creating one; read the actual installed versions and conventions.
4. **Plan**: write a short implementation plan.
5. **Implement**: make the smallest clean change that solves the task.
6. **Validate**: run `npx tsc --noEmit`, `npm run lint`, `npm run build`.
7. **Review**: architecture, theme consistency, accessibility, responsiveness, performance, duplication, security, unnecessary dependencies.
8. **Report**: what changed, which files, why, validation results, and any architectural decisions.

---

## 34. DO NOT MODIFY THE RULES FILE CASUALLY

AI agents must **not** modify `TRAVORA_FRONTEND_RULES.md` when their implementation conflicts with it.

If a rule needs to change:

1. Identify the conflict.
2. Explain why the existing rule is insufficient for the current need.
3. Ask the project owner for approval.
4. Only modify the rules after explicit owner approval.

This file is a governance document, not a suggestion.

---

## 35. WHEN RULES CONFLICT WITH A REQUEST

If someone asks for something that conflicts with this document:

> "This request conflicts with `TRAVORA_FRONTEND_RULES.md` because **<reason>**. The current rule is **<rule>**. I recommend **<option>**. Please confirm whether you want to override the existing rule."

An explicit project-owner instruction takes precedence — but the conflict must be stated first.

---

## 36. DO NOT REWRITE WORKING ARCHITECTURE

When implementing a feature, do not rewrite existing architecture simply because of a personal preference. Do not replace the component library, folder structure, theme system, state strategy, or API strategy without a demonstrated technical reason and owner approval. Prefer incremental improvement.

---

## 37. REUSE BEFORE CREATE

Before creating a component, hook, utility, provider, or API abstraction, **search the existing codebase.**

- If an existing abstraction is suitable → use it.
- If not → extend it carefully, or create a new one only when necessary.

---

## 38. AVOID GOD FILES

Do not let files become enormous. If a component becomes hard to understand, extract meaningful subcomponents — but do not split everything into tiny files. Aim for readable, logical, maintainable units.

---

## 39. NO MAGIC ARCHITECTURE

Do not introduce patterns simply because they sound professional. Every abstraction must solve a real problem. Avoid unnecessary: factories, managers, registries, service classes, repositories, extra context providers, wrapper components.

---

## 40. DESIGN CONSISTENCY

Every new UI feature must reuse the established: colors, typography, spacing, radius, buttons, cards, inputs, badges, dialogs, and navigation patterns. Do not invent a new visual language per page. If a genuinely new UI pattern is needed, integrate it into the design system rather than making an isolated style.

---

## 41. FINAL QUALITY STANDARD

Every frontend change should feel like it belongs to the same product. Keep consistent: brand, typography, color, spacing, components, interaction, accessibility, responsive behavior, architecture, naming, TypeScript, and performance.

---

## 42. DEFINITION OF DONE

A task is **not** complete when the UI merely appears. It is complete only when:

- functionality works
- TypeScript passes (`npx tsc --noEmit`)
- ESLint passes (`npm run lint`)
- build passes (`npm run build`)
- responsive behavior is acceptable
- accessibility basics are handled
- theme is consistent
- reusable components are reused
- architecture is respected
- no unnecessary dependency was introduced
- no sensitive information is exposed
- no obvious performance regression was introduced
- no unnecessary duplication was introduced

All of `npx tsc --noEmit`, `npm run lint`, and `npm run build` must pass.

---

## 43. FINAL AGENT CHECKLIST

Before finishing **any** task, verify:

- [ ] Did I read `TRAVORA_FRONTEND_RULES.md`?
- [ ] Did I inspect existing code before creating new code?
- [ ] Did I reuse existing components where possible?
- [ ] Did I follow the feature-oriented architecture?
- [ ] Did I use the centralized theme?
- [ ] Did I avoid hard-coded brand colors?
- [ ] Did I avoid unnecessary `"use client"`?
- [ ] Did I keep TypeScript strict (no `any`, no `@ts-ignore`)?
- [ ] Did I avoid unnecessary dependencies?
- [ ] Did I consider accessibility?
- [ ] Did I consider responsive design?
- [ ] Did I consider performance?
- [ ] Did I avoid exposing sensitive information?
- [ ] Did I avoid business logic inside UI primitives?
- [ ] Did I avoid unnecessary global state?
- [ ] Did I avoid overengineering?
- [ ] Did I run `npx tsc --noEmit`?
- [ ] Did I run `npm run lint`?
- [ ] Did I run `npm run build`?

---

## 44. GOLDEN RULE

Build Travora as a product, not as a collection of pages. Every component, feature, dependency, design decision, and architectural change should make the system more **consistent**, **maintainable**, **understandable**, and **ready for future growth** — without introducing complexity before it is needed.
