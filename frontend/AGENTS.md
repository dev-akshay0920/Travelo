# Travora — Next.js agent rules

> This file is auto-managed by `next`. It points coding agents (Kilo/Claude) at
> the version-specific Next.js docs bundled in `node_modules/next/dist/docs/` so
> that generated code matches the installed Next.js 16 APIs and conventions.

These rules supplement the project README.

## Never write tests

Do not create test files, test utilities, test configurations, or any testing-related code for this project.

## Next.js 16 specifics

- App Router is the only router configured.
- Use the **App Router** file conventions (`app/`), not `pages/`.
- Server Components are the default. Only add `"use client"` at the top of a
  file when the component needs React state, event handlers, browser APIs, or
  client-side effects.
- React 19 patterns apply (no legacy context `Consumer` hacks, no `findDOMNode`).
- Route groups `(public)`, `(auth)`, etc. are used for segment organisation;
  they do **not** appear in URLs.
- Layout/Loading/Error/NotFound boundaries live in `app/` and are scoped via
  route groups per feature.
