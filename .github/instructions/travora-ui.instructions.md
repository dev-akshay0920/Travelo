---
description: "Use when building or changing Travora frontend UI, styles, forms, cards, buttons, dialogs, menus, typography, or date displays."
applyTo: "frontend/src/**"
---

# Travora UI standards

Follow `frontend/TRAVORA_FRONTEND_RULES.md`. The shared primitives and tokens are the source of truth for frontend UI.

- Use semantic theme tokens from `frontend/src/app/globals.css`; never add raw hex colors, one-off brand colors, or arbitrary CSS values for system styles.
- Brand palette: blue primary, teal supporting brand, restrained amber highlights. Keep neutral `secondary` and `accent` tokens for ordinary control surfaces.
- Reuse `components/ui` primitives. Change a shared primitive only when standardizing the system, not to patch one page.
- Use `PageContainer` for consistent page width/gutters and `PageStack` for vertical section rhythm; avoid nesting page gutters inside a shell that already provides them.
- Use `AppShellHeader` and `IconSidebar` for authenticated app-shell chrome. Keep role-specific links/configuration in the feature shell, not duplicated navigation markup.
- Reuse `LoadingState`, `EmptyState`, and `ErrorState` for page-level states, and `Spinner` for compact async actions. Avoid custom spinner markup.
- Use `text-display`, `text-page-title`, `text-section-title`, `text-card-title`, `text-body`, `text-body-sm`, and `text-caption` for the established type scale. Labels are 14px; reserve 12px for metadata.
- Default buttons and form controls are 40px high; small controls are 36px and large buttons are 44px. Keep mobile form text at least 16px.
- Cards use the shared 12px radius, 20px spacing, subtle border, and shadow. Dialogs use 24px padding, the shared radius, and a clear header/body/footer.
- Use shared popover surfaces for dropdowns and selects. Use `d MMM yyyy` for human-readable dates; keep date-only form/API values in ISO `yyyy-MM-dd`.
- Preserve responsive behavior, keyboard interaction, visible focus, accessible labels, and disabled/error states. Avoid glassmorphism and decorative global backgrounds.
- New UI must use semantic colors. Legacy palette utilities are compatibility aliases to the design tokens; do not add more palette-specific utility classes or raw color values.
