---
description: "Use when building or changing Travora frontend UI, styles, forms, cards, buttons, dialogs, menus, typography, or date displays."
applyTo: "frontend/src/**"
---

# Travora UI standards

Follow `frontend/TRAVORA_FRONTEND_RULES.md`. The shared primitives and tokens are the source of truth for frontend UI.

- Use semantic theme tokens from `frontend/src/app/globals.css`; never add raw hex colors, one-off brand colors, or arbitrary CSS values for system styles.
- Brand palette: blue primary, teal supporting brand, restrained amber highlights. Keep neutral `secondary` and `accent` tokens for ordinary control surfaces.
- Reuse `components/ui` primitives. Change a shared primitive only when standardizing the system, not to patch one page.
- The workspace visual language is compact and productivity-oriented (clear panes, crisp dividers, quick interactions), inspired by established work apps without copying Microsoft Outlook branding or product-specific layouts. Preserve Travora's travel-focused public experience.
- Use `PageContainer` for consistent page width/gutters and `PageStack` for vertical section rhythm; avoid nesting page gutters inside a shell that already provides them.
- Use `AppShellHeader` and `IconSidebar` for authenticated shells across roles. Keep desktop navigation labeled and persistent; retain visible labels in mobile navigation. Keep role-specific links/configuration in the feature shell.
- Reuse the shared `Card` primitive and its `size`/`variant` props. Prefer compact 10px-radius surfaces with subtle borders; avoid glass or custom hover treatments that override the shared card surface.
- Structure long dialogs with a fixed `DialogHeader`, a `DialogBody` that owns vertical scrolling, and a fixed `DialogFooter`. Use the shared `Sheet` primitives for mobile filter/search panels instead of hand-built overlays.
- Use the shared `Table` primitives and `Pagination` control for tabular data and paginated lists; keep empty/loading rows and responsive overflow within the table container.
- Reuse `LoadingState`, `EmptyState`, and `ErrorState` for page-level states, and `Spinner` for compact async actions. Avoid custom spinner markup.
- Use Lucide icons with 16px default control sizing, accessible names for icon-only actions, and `Tooltip` when their purpose is not otherwise visible.
- Use `text-display`, `text-page-title`, `text-section-title`, `text-card-title`, `text-body`, `text-body-sm`, and `text-caption` for the established type scale. Labels are 14px; reserve 12px for metadata.
- Default buttons and form controls are 40px high; small controls are 36px and large buttons are 44px. Keep mobile form text at least 16px.
- Cards use the shared 10px radius, 16px spacing, subtle border, and shadow. Dialogs use 24px content padding, the shared radius, and a fixed header/footer around a scrollable body.
- Use shared popover surfaces for dropdowns and selects. Use `d MMM yyyy` for human-readable dates; keep date-only form/API values in ISO `yyyy-MM-dd`.
- Preserve responsive behavior, keyboard interaction, visible focus, accessible labels, and disabled/error states. Avoid glassmorphism and decorative global backgrounds.
- New UI must use semantic colors. Legacy palette utilities are compatibility aliases to the design tokens; do not add more palette-specific utility classes or raw color values.
- Keep workspace transitions brief and honor reduced-motion preferences. Avoid decorative movement and lift-on-hover effects in productivity surfaces.
