# Travora

**Travora** is a travel discovery and lead-generation marketplace where customers
find trusted travel agencies and handcrafted journeys, then connect directly
with agencies to plan their trips.

This repository contains the **Next.js frontend foundation**. It is structured to
receive upcoming features (agency profiles, packages, leads, chat, analytics)
without architectural restructuring.

---

## Tech Stack

| Layer        | Technology                                                      |
| ------------ | --------------------------------------------------------------- |
| Framework    | [Next.js](https://nextjs.org) 16 (App Router)                   |
| Language     | TypeScript (strict)                                             |
| Runtime      | React 19                                                        |
| Styling      | Tailwind CSS v4                                                 |
| Components   | [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives)       |
| Icons        | [Lucide React](https://lucide.dev)                              |
| Fonts        | [Inter](https://rsms.me/inter/) via `next/font`                 |
| Lint         | ESLint 9 (flat config, `eslint-config-next`)                     |

All dependencies are MIT-licensed.

## Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

```bash
npm run lint      # ESLint
npm run build     # Production build (also runs ESLint + TypeScript)
npm start         # Serve the production build
```

Type-check without emitting:

```bash
npx tsc --noEmit
```

## Environment

Copy the example and point it at your backend when the API is available:

```bash
cp .env.example .env.local
```

| Variable                    | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`       | Canonical app URL (used for metadata/SSR).        |
| `NEXT_PUBLIC_API_URL`       | Backend API base URL (e.g. `http://localhost:5000/api/v1`). |

> **Security note:** Only non-sensitive values use the `NEXT_PUBLIC_` prefix.
> Server-only secrets (database URLs, signing secrets) must never be prefixed
> with `NEXT_PUBLIC_` and are never committed.

## Architecture

The project follows a **feature-oriented** layout with strict dependency
direction: `app` → `features` → `components / lib`.

```text
src/
├── app/                     # Routes, layouts, route groups, boundaries
│   ├── (public)/            # Unauthenticated routes (landing, marketing)
│   ├── (auth)/              # Future authentication routes
│   ├── (customer)/          # Future customer-facing routes
│   ├── (agency)/            # Future agency-facing routes
│   ├── (admin)/             # Future admin routes
│   ├── layout.tsx           # Root layout: font, metadata, global CSS
│   ├── globals.css          # Centralized design tokens
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── components/
│   ├── ui/                  # shadcn/ui primitives (untouched)
│   ├── layout/              # Reusable layout chrome (header, footer)
│   ├── navigation/          # Shared navigation
│   └── shared/              # Genuinely cross-feature components
│
├── features/                # Feature-oriented modules (filled incrementally)
│   ├── auth, agencies, packages, leads, chat, watchlist, analytics
│
├── lib/
│   ├── api/                 # Typed fetch client + errors (no backend required)
│   ├── constants/           # App-wide constants
│   └── utils.ts             # className helper
│
├── config/                  # Centralized app config (site, navigation)
├── types/                   # Global/shared TypeScript types
├── hooks/                   # Shared hooks (prepared for future use)
└── providers/               # Global providers (none yet)
```

### Design system

Colors live as **semantic CSS variables** in `src/app/globals.css` and are
mapped to Tailwind tokens through `@theme`. Components use tokens such as
`bg-primary`, `text-foreground`, and `border-border` — never raw hex — so the
palette is rebranchable from one place.

```text
Primary  #0F4C5C   Secondary #0E7490   Accent #F9735B
Background #F8FAFC  Surface  #FFFFFF    Foreground #0F172A
```

Dark mode is prepared (toggle the `dark` class on `<html>`) but intentionally
not fully designed yet.

### API boundary

`src/lib/api/` provides a typed, `fetch`-based client (`createApiClient`) that
targets `/api/v1/...`. The frontend starts without a backend: requests fail
gracefully with a typed `ApiError` rather than crashing the app.

## Principles

- **Strict TypeScript** — `strict: true`, no `any`, no `@ts-ignore`, no
  `@ts-nocheck`.
- **Server Components by default** — Client Components are used only where
  interactivity requires them; the client boundary is kept minimal.
- **Feature-oriented architecture** with one-way dependencies.
- **Centralized design system** — single source of truth for tokens and fonts.
- **MIT-first dependencies** — shadcn/ui, Radix UI, Tailwind CSS, Lucide, Inter.
- **No premature complexity** — no state manager, no query client, no form or
  validation libraries until a feature actually needs them.
- **Performance-conscious** — minimal JS bundle, optimized fonts, no client-side
  data fetching on static foundation pages.
