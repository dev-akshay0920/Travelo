# Travora Backend

Production-quality backend foundation for **Travora** — a travel and tour agency platform.

> **Stage:** V1 MVP — Backend Foundation
> **Business Model:** Lead generation
> This repository currently contains **only the backend foundation infrastructure**. Business features (auth, agencies, packages, leads, chat, booking, payments, analytics) are intentionally **not** implemented yet and will be added in subsequent steps.

---

## Stack

- **Runtime:** Node.js (>= 20)
- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **Database:** MongoDB via Mongoose
- **Validation:** Zod (foundation-ready)
- **Security:** Helmet, CORS, express-rate-limit
- **Logging:** Pino (structured)
- **Tooling:** tsx, ESLint, typescript-eslint

---

## Architecture

Travora backend follows a **modular monolith** approach — one deployable application with clear feature-module boundaries.

```
HTTP Request
    ↓
Express Middleware (security, request-id, logging, cors, rate limit)
    ↓
Route  (/api/v1/...)
    ↓
Validation (Zod)
    ↓
Controller   (thin — HTTP only)
    ↓
Service      (business rules, framework-agnostic)
    ↓
Repository   (persistence boundary)
    ↓
Mongoose Model
    ↓
MongoDB
```

Response flow mirrors this in reverse through a **DTO / serializer** layer, ensuring clients never receive raw database documents.

---

## Folder Structure

```
travora-backend/
├── src/
│   ├── config/         # env, database, app config
│   ├── modules/        # feature modules (auth, users, agencies, ...)
│   ├── middleware/     # cross-cutting concerns
│   ├── shared/         # errors, responses, constants, types, utils, uploads, storage
│   ├── routes/         # route registration
│   ├── app.ts          # Express app factory
│   └── server.ts       # bootstrap, DB, graceful shutdown
├── .env.example
├── .gitignore
├── .nvmrc
├── eslint.config.mjs
├── tsconfig.json
└── package.json
```

Feature modules will follow the pattern:

```
modules/<feature>/
  <feature>.model.ts
  <feature>.schema.ts
  <feature>.repository.ts
  <feature>.service.ts
  <feature>.controller.ts
  <feature>.routes.ts
  <feature>.types.ts
  index.ts
```

---

## Development

```bash
npm install
npm run dev
```

Runs the server with hot reload via `tsx watch`.

### Seed local travel demo data

With `MONGODB_URI` configured in `.env`, populate the existing users, roles, agencies, and packages collections:

```bash
npm run seed:travel-data
```

The seed creates eight approved demo agencies and packages covering domestic, regional, and international trips; all trip themes; varied prices and durations; future dates; featured and sold-out listings; and a few private draft/completed records. It is safe to run repeatedly: demo records are upserted by their stable email, agency slug, and package slug, and unrelated records are left untouched. Each demo owner can sign in with the password `TravoraDemo!2026` and the agency email addresses listed in `src/scripts/seed-travel-data.ts`. These are local development credentials only; do not use the seed or password in production.

The public frontend currently calls `/public/packages`, while this backend only exposes authenticated agency package routes. Seeded documents are present in MongoDB for testing, but the public listing page will remain empty until a public packages API is implemented and connected.

---

## Type Checking

```bash
npm run typecheck
```

Strict TypeScript — zero errors required.

---

## Linting

```bash
npm run lint
```

---

## Build

```bash
npm run build
```

Outputs to `dist/`.

---

## Start (Production)

```bash
npm run start
```

Runs the compiled `dist/server.js`. Ensure environment variables are set.

---

## Environment

Copy `.env.example` to `.env` and adjust values. The application **validates environment variables at startup** and exits if any required value is missing.

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | no | `development` \| `production` |
| `PORT` | no | HTTP port (default `5000`) |
| `MONGODB_URI` | **yes** | MongoDB connection string |
| `CLIENT_URL` | no | Allowed CORS origin (frontend) |
| `LOG_LEVEL` | no | Pino level (`info`, `debug`, ...) |
| `BODY_JSON_LIMIT` | no | JSON body size limit (default `1mb`) |
| `RATE_LIMIT_WINDOW_MS` | no | Rate-limit window in ms |
| `RATE_LIMIT_MAX` | no | Max requests per window per IP |
| `FILEBASE_ENDPOINT` | no | Filebase S3 API endpoint (currently `https://s3.filebase.io`) |
| `FILEBASE_REGION` | no | Filebase SigV4 region (currently `auto`) |
| `FILEBASE_BUCKET_NAME` | no | Dedicated agency profile image bucket |
| `FILEBASE_ACCESS_KEY_ID` | no | Backend-only Filebase access key |
| `FILEBASE_SECRET_ACCESS_KEY` | no | Backend-only Filebase secret key |
| `FILEBASE_PUBLIC_BASE_URL` | no | HTTPS public-read/CDN base URL, separate from the S3 endpoint (public bucket URL: `https://<bucket-name>.s3.filebase.io`) |
| `FILEBASE_ENDPOINT` | no | S3-compatible API endpoint for agency profile images |
| `FILEBASE_REGION` | no | Region/signing value required by Filebase |
| `FILEBASE_BUCKET_NAME` | no | Dedicated agency profile image bucket |
| `FILEBASE_ACCESS_KEY_ID` | no | Backend-only Filebase access key |
| `FILEBASE_SECRET_ACCESS_KEY` | no | Backend-only Filebase secret key |
| `FILEBASE_PUBLIC_BASE_URL` | no | HTTPS public-read/CDN base URL, separate from the S3 endpoint |

Configure all six `FILEBASE_*` variables together to enable agency profile image uploads. Leave them all unset to keep the rest of the API available while image storage is unconfigured. Never expose the access keys to the frontend. The configured public delivery host must allow anonymous reads only—not writes, overwrites, or bucket listing.

### Shared upload infrastructure

Backend upload features must reuse `src/shared/uploads/single-file-upload.middleware.ts` for bounded multipart parsing and `src/shared/storage/file-storage.service.ts` for Filebase object storage, public URL construction, deletion, and client lifecycle. Feature modules remain responsible for authentication/ownership, allowed file types and signatures, generated key prefixes, persistence, and feature-specific cleanup rules. Do not add direct S3 client calls or standalone/generic unauthenticated upload endpoints inside feature modules.

---

## API

- `GET /health` — process health check (safe, no secrets)
- `GET /api/v1` — API root, returns version + status
- `POST /api/v1/agencies/me/logo` — authenticated agency-owner profile image upload (`multipart/form-data`, field `file`; JPEG/PNG/WebP, maximum 5 MiB)

All future business endpoints live under `/api/v1/...`.

### Response format

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {}
  }
}
```

---

## Security Foundation

- **Helmet** — secure default HTTP headers
- **CORS** — explicit origin from `CLIENT_URL`
- **Rate limiting** — global limiter, future per-route limits
- **Body size limits** — configurable via `BODY_JSON_LIMIT`
- **Centralized error handler** — never leaks stack traces or internal details in production
- **Request IDs** — correlation across logs
- **Structured logging** — Pino, with sensitive fields excluded
- **No secrets in source** — all configuration via environment

> Every request is treated as untrusted. Future auth, validation, and authorization will be enforced server-side.

---

## Graceful Shutdown

On `SIGTERM` / `SIGINT`, the server:

1. Stops accepting new connections
2. Closes the HTTP server
3. Disconnects from MongoDB
4. Exits cleanly

---

## Intentionally Not Implemented (yet)

Authentication, users, agencies, packages, leads, chat, booking, payments, reviews, analytics, file uploads, real-time, queues, Redis, microservices.

These will be implemented feature-by-feature in subsequent steps without restructuring this foundation.