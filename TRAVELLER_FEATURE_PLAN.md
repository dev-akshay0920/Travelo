# Travora — Traveller Feature Plan

## Status
Current: Traveller shell exists (`/traveller` stub only). No Explore/Leads/Profile pages. Backend supports public packages only; leads/watchlist/chat/analytics modules not yet built.

## Scope (MVP → V3)

### Phase 1 — Core browsing (immediate)
| Feature | Page | Backend | Notes |
|---------|------|---------|-------|
| Explore packages | `/traveller/explore` | ✅ `GET /api/v1/public/packages` | Grid/list, filters (destination, theme, dates, price, duration), infinite scroll |
| Package detail | modal / `/packages/:id` | ✅ | View-only details + images |
| Contact agency / create lead | from package page | ❌ new `leads` module | Traveller expresses interest → agency notified |
| My Leads | `/traveller/leads` | ❌ new `leads` module | List leads, status, agency replies |
| Traveller profile | `/traveller/profile` | ⚠️ `users` model exists, no profile endpoints | View/edit basic info |

### Phase 2 — Engagement
| Feature | Page | Backend | Notes |
|---------|------|---------|-------|
| Watchlist / saved packages | `/traveller/watchlist` | ❌ new `watchlist` module | Save packages for later |
| Chat traveller↔agency | `/traveller/chat/:leadId` | ❌ new `chat` module | Message threads per lead |
| Reviews & ratings | `/traveller/reviews` | ❌ new `reviews` module | Rate trips/agencies after travel |

### Phase 3 — Insights
| Feature | Page | Backend | Notes |
|---------|------|---------|-------|
| Traveller analytics | `/traveller/analytics` | ❌ new `analytics` module | Spending, favorite destinations, trip history |

## Navigation (update `travellerNavigation`)
- Home `/traveller`
- Explore `/traveller/explore`
- My Leads `/traveller/leads`
- Watchlist `/traveller/watchlist` (V2)
- Profile `/traveller/profile`

## Backend modules to add
1. `leads` — create/list/update lead, traveller ↔ agency linkage
2. `watchlist` — save/unsave package per traveller
3. `chat` — conversation + messages
4. `reviews` — rating + review per package/agency
5. `analytics` — traveller-level aggregates

## Frontend files to create
- `src/app/(traveller)/explore/page.tsx` — package browser
- `src/app/(traveller)/leads/page.tsx` — leads list
- `src/app/(traveller)/profile/page.tsx` — profile view/edit
- `src/features/traveller/components/` — shared traveller components
- Update `src/features/packages/components/package-detail-modal.tsx` — already done (sticky header/footer, wide width)
- Update `src/config/role-navigation.ts` — add watchlist

## Design conventions
- Use `TravellerShell` layout (sticky header, nav, user menu)
- shadcn/ui dialogs with sticky header/footer, scrollable middle content
- `max-w-6xl w-[95vw]` modal width
- Strict TypeScript, no `any`, Server Components by default

## Open questions to confirm
1. Start with Explore page first?
2. Build backend `leads` module now, or keep traveller read-only until backend is ready?
3. Add Watchlist in Phase 1 or Phase 2?
