# TRAVORA BACKEND RULES

> **Backend Engineering Constitution — Travora**
> This document is the **single source of truth** for backend engineering standards, architecture, security, data handling, API design, coding standards, performance, and AI-agent behavior on the Travora backend.
>
> It is **not** a README. It is a governance document.

---

## 0. ABSOLUTE GOVERNANCE RULE

Before making any change to the Travora backend, **every AI agent and developer MUST read and follow `TRAVORA_BACKEND_RULES.md`**. These rules are mandatory unless the project owner explicitly instructs otherwise.

- Do **not** silently introduce a new architecture, dependency, database pattern, API convention, security mechanism, or coding practice that conflicts with this document.
- If a requested implementation conflicts with these rules, **stop** and identify the conflict before proceeding.
- **Never** weaken security, validation, authorization, type safety, or architectural standards simply to make an implementation easier.

---

## 1. PROJECT IDENTITY

| Field | Value |
| --- | --- |
| Product | Travora |
| Repository | `travora-backend` |
| Application | Travel & Tour Agency Platform |
| Stage | V1 MVP |
| Business model | Lead generation |
| Architecture | Modular Monolith |
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| API style | REST |
| API version | `/api/v1` |

Travora will eventually support:

- customers
- travel agencies
- administrators
- travel packages
- lead generation
- communication / chat
- analytics
- future booking
- future payments
- future reviews

The current product must remain focused and must **not** be over-engineered for hypothetical future requirements.

---

## 2. ARCHITECTURAL PHILOSOPHY

Travora backend must be:

```
Secure
+
Maintainable
+
Modular
+
Type-safe
+
Observable
+
Performance-conscious
+
Flexible
-
Unnecessary complexity
```

- **Use a modular monolith.**
- Do **not** use microservices unless explicitly approved by the project owner.
- The backend should be simple enough for a new developer to understand, but structured enough to grow significantly.

---

## 3. LOCKED TECHNOLOGY STACK

The default backend stack is locked:

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose
- **API:** REST
- **API version:** `/api/v1`
- **Logging:** Structured, using a production-grade logger such as **Pino**
- **Validation:** Strongly typed (e.g. **Zod**) when validation infrastructure is required
- **Security middleware:** Helmet, CORS, rate limiting, validation

Do **not** introduce alternative frameworks (NestJS, Fastify, Koa, etc.), alternative ORMs, alternative databases, alternative runtimes, or alternative API styles (GraphQL, gRPC, tRPC) without explicit project-owner approval.

---

## 4. DEPENDENCY POLICY

Every dependency must have a reason. Before installing any package, answer:

1. Is it actually necessary?
2. Can Node.js solve this?
3. Can Express solve this?
4. Can existing project utilities solve this?
5. Is the package actively maintained?
6. Is the license acceptable?
7. Does it introduce security risk?
8. Does it duplicate an existing dependency?
9. Does it increase bundle / runtime complexity?
10. Will the project still be maintainable with it?

Do **not**:

- install dependencies because they are popular,
- install multiple libraries that solve the same problem,
- introduce unnecessary frameworks, ORMs, session systems, or infrastructure.

---

## 5. LICENSE POLICY

- Prefer **MIT-compatible** and permissively licensed dependencies.
- Verify the license before adding any significant dependency.
- Avoid proprietary or restrictive dependencies without explicit project-owner approval.

---

## 6. MODULAR MONOLITH

The backend is a single deployable application containing logical feature modules:

```
Travora Backend
 ├── Auth
 ├── Users
 ├── Agencies
 ├── Packages
 ├── Leads
 ├── Chat
 └── Analytics
```

Do **not** create separate applications for each feature.

---

## 7. TARGET FOLDER STRUCTURE

```
src/
├── config/
│   ├── env.ts
│   ├── database.ts
│   └── app.ts
├── modules/
│   ├── auth/
│   ├── users/
│   ├── agencies/
│   ├── packages/
│   ├── leads/
│   ├── chat/
│   └── analytics/
├── middleware/
│   ├── auth.middleware.ts
│   ├── role.middleware.ts
│   ├── validation.middleware.ts
│   ├── rate-limit.middleware.ts
│   ├── error.middleware.ts
│   └── not-found.middleware.ts
├── shared/
│   ├── errors/
│   ├── responses/
│   ├── constants/
│   ├── types/
│   └── utils/
├── routes/
│   └── index.ts
├── app.ts
└── server.ts
```

This is a guideline — **not permission** to create empty files for features that do not exist yet.

---

## 8. MODULE STRUCTURE

When a real feature is implemented, a module may use:

```
modules/<feature>/
  ├── <feature>.model.ts
  ├── <feature>.schema.ts
  ├── <feature>.repository.ts
  ├── <feature>.service.ts
  ├── <feature>.controller.ts
  ├── <feature>.routes.ts
  ├── <feature>.types.ts
  └── index.ts
```

Use only the layers that provide real value. Do **not** create every layer for every feature automatically.

---

## 9. REQUEST FLOW

The preferred request flow is:

```
HTTP Request
   ↓
Global Middleware
   ↓
Route
   ↓
Validation
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Mongoose
   ↓
MongoDB
```

Response flow:

```
MongoDB
   ↓
Repository
   ↓
Service
   ↓
Serializer / DTO
   ↓
Controller
   ↓
HTTP Response
```

Keep this flow predictable.

---

## 10. ROUTE RESPONSIBILITY

Routes define:

- HTTP method
- endpoint path
- middleware
- controller

Routes must **not** contain:

- database queries
- business logic
- large transformations
- complex validation logic

Prefer:

```ts
router.get("/", validationMiddleware, controller.getSomething);
```

Avoid `router.get("/...", huge async function ...)`.

---

## 11. CONTROLLER RESPONSIBILITY

Controllers handle HTTP concerns. They may:

- read request parameters
- read validated request data
- call services
- construct HTTP responses
- pass errors to centralized handling

Controllers must **not** contain complex business rules or direct database queries.

---

## 12. SERVICE RESPONSIBILITY

Services contain business logic. They:

- operate on domain concepts
- coordinate business operations
- enforce business rules
- call repositories
- call external services through appropriate abstractions

Services must **not** depend on Express `Request` or `Response` objects.

---

## 13. REPOSITORY RESPONSIBILITY

Repositories handle persistence concerns:

- `findById()`
- `findByEmail()`
- `create()`
- `update()`
- `delete()`
- `findMany()`

Repositories isolate database implementation from business logic where appropriate. Do **not** scatter Mongoose queries throughout controllers and services — but also do **not** create repositories purely for ceremony.

---

## 14. DATABASE MODEL RESPONSIBILITY

Mongoose models define:

- schema
- field types
- persistence constraints
- indexes
- appropriate schema options

Business workflows do **not** live in models. They live in services.

---

## 15. DATABASE ACCESS RULE

All MongoDB access must go through Mongoose. Do **not** mix:

- Mongoose
- native MongoDB driver
- another ORM
- another database library

without explicit architectural approval.

---

## 16. MONGODB DATA EXPOSURE

Never return raw Mongoose documents directly to clients when they contain internal fields.

Avoid:

```ts
res.json(document);
```

Always use:

```
MongoDB Document
    ↓
Mapper / Serializer / DTO
    ↓
Public API Response
```

The API must explicitly control exposed fields.

---

## 17. LEAST DATA PRINCIPLE

Return **only** what the client needs. Sensitive fields must never leak:

- password hashes
- reset tokens
- refresh tokens
- internal admin notes
- internal metadata
- private contact information
- moderation information
- internal database fields

Every response must be intentional.

---

## 18. API VERSIONING

Business endpoints live under:

```
/api/v1
```

Examples:

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/agencies`
- `/api/v1/packages`
- `/api/v1/leads`
- `/api/v1/chat`

Do **not** create business endpoints outside the versioned API. Health endpoints may remain outside `/api/v1` if appropriate.

---

## 19. API RESPONSE CONTRACT

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
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

Consistency is mandatory. Do **not** return unrelated response shapes from similar endpoints.

---

## 20. HTTP STATUS CODES

Use semantically correct codes:

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`
- `429 Too Many Requests`
- `500 Internal Server Error`

Never return `200` for every operation regardless of success/failure.

---

## 21. ERROR ARCHITECTURE

Centralized error handling:

```
Application Error
   ↓
Error Middleware
   ↓
Safe API Response
```

Application errors must support:

- HTTP status
- machine-readable code
- safe human-readable message
- optional safe details

---

## 22. ERROR SECURITY

Never expose to clients:

- stack traces
- database errors
- file paths
- SQL / Mongo query information
- environment variables
- internal service information

Detailed information may be logged server-side where appropriate.

---

## 23. UNKNOWN ERRORS

Unexpected errors must produce a safe generic response:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

## 25. VALIDATION

The backend must **never** trust client input. Validate:

- request body
- path parameters
- query parameters
- headers where relevant

Validation must happen **before** business logic:

```
Request
 ↓
Validation
 ↓
Controller
 ↓
Service
```

---

## 26. FRONTEND VALIDATION IS NOT SECURITY

Frontend validation exists for UX. It does **not** replace backend validation. The backend is the final validation authority.

---

## 27. SANITIZATION AND NORMALIZATION

Normalize inputs where appropriate:

- trim strings
- normalize emails
- enforce string lengths
- enforce enum values
- enforce numeric ranges
- reject unexpected structures

Do **not** apply blind sanitization that mutates valid business data. Validation must be domain-aware.

---

## 28. MASS ASSIGNMENT PROTECTION

Never blindly pass an entire request body into a database update:

```ts
// NEVER
Model.findByIdAndUpdate(id, req.body);
```

Always use allowlisted fields:

```
Request body
 ↓
Validated schema
 ↓
Allowed fields
 ↓
Service
 ↓
Repository
```

---

## 29. AUTHENTICATION

Authentication will be implemented later. The architecture must be ready for:

- authentication middleware
- authorization middleware
- role middleware

Future authentication may include:

- password authentication
- token / session strategy
- refresh mechanism
- email verification
- password reset
- OAuth (if required)

Do **not** implement these merely because the architecture mentions them.

---

## 30. AUTHORIZATION

Authorization is **always** backend-controlled. Future protected routes must verify:

```
Authentication
 ↓
Role
 ↓
Permission
 ↓
Resource Ownership
```

server-side.

---

## 31. ROLE MODEL

Expected business roles:

- `customer`
- `agency`
- `admin`

Role information must be trusted **only** after server-side authentication.

---

## 32. RESOURCE OWNERSHIP

Always verify for protected resources:

- Is the user authenticated?
- Is the user allowed to access this resource?
- Does the resource belong to the user / agency?
- Does the user's role permit this operation?

Mandatory for every protected resource.

---

## 33. IDOR PROTECTION

IDs are **identifiers, not authorization**. Knowing an ID must never automatically grant access. Always verify authenticated identity and permissions.

---

## 34. PASSWORDS AND CREDENTIALS

When authentication is implemented:

- Never store plaintext passwords.
- Never log passwords.
- Never return password hashes.
- Never send passwords through API responses.
- Use a proper password hashing algorithm.

Do **not** implement authentication in this initialization stage.

---

## 35. TOKEN SECURITY

When authentication is implemented:

- Never log access tokens, refresh tokens, reset tokens, or OTP secrets.
- Never return sensitive tokens unnecessarily.
- Storage and transport of tokens must be deliberately designed.

---

## 36. ENVIRONMENT CONFIGURATION

All environment configuration must be centralized in a typed configuration layer.

Avoid scattered `process.env.X` usage across business modules. Prefer `config.env` or equivalent.

---

## 37. ENVIRONMENT VALIDATION

Validate required environment variables at startup. If configuration is missing:

- fail fast,
- provide a clear developer-facing error,
- do **not** start an incorrectly configured application.

Never silently use `undefined` configuration.

---

## 38. SECRET MANAGEMENT

Never commit:

- `.env`
- database passwords
- API keys
- JWT secrets
- private keys
- cloud credentials
- email credentials

Use environment variables or appropriate secret-management infrastructure.

---

## 39. .env.example

Maintain `.env.example` with safe placeholder values. It documents required configuration without containing real credentials.

---

## 40. LOGGING

Use structured logging (Pino or equivalent). Avoid `console.log` as the primary mechanism.

Logs should include:

- timestamp
- level
- request ID
- event
- safe metadata

---

## 41. LOGGING SECURITY

Never log:

- passwords
- access tokens
- refresh tokens
- API keys
- database credentials
- secrets
- sensitive personal information

unless there is an explicit, justified reason.

---

## 42. REQUEST ID / CORRELATION

Use a request identifier for tracing:

```
HTTP Request
 ↓
Request ID
 ↓
Controller → Service → Repository → Logs
```

---

## 43. CORS

Configure CORS explicitly. The frontend origin must come from configuration:

```
CLIENT_URL=http://localhost:3000
```

Do **not** use unrestricted `origin: "*"` for authenticated production APIs unless explicitly justified.

---

## 44. SECURITY HEADERS

Use Helmet or an equivalent established security middleware. Do **not** reinvent standard HTTP security headers without strong reason.

---

## 45. RATE LIMITING

Use rate limiting where appropriate. Important future targets:

- authentication
- password reset
- OTP / email verification
- public lead submission
- chat
- other abuse-sensitive endpoints

Use sensible limits — not so aggressive that normal users cannot use it.

---

## 46. REQUEST BODY LIMITS

Set explicit body-size limits. Never allow unlimited request bodies by default. Large files must use dedicated upload / storage mechanisms.

---

## 47. FILE UPLOADS

File uploads are not part of the foundation. When implemented later:

- Prefer object storage.
- Do **not** store large binary files in MongoDB.

Target architecture:

```
Client
 ↓
Upload mechanism
 ↓
Object Storage
 ↓
Metadata
 ↓
MongoDB
```

---

## 48. DATABASE CONNECTION

Centralize MongoDB connection logic in `src/config/database.ts`. The database layer must:

- establish connection,
- handle errors,
- log status safely,
- avoid duplicate initialization,
- support graceful shutdown.

Do **not** connect to MongoDB from controllers or individual modules.

---

## 49. DATABASE FAILURE

If MongoDB is required and cannot connect during startup:

- log the failure,
- do **not** pretend the application is healthy,
- stop startup cleanly.

---

## 50. DATABASE INDEXES

Indexes must be intentional, based on:

- uniqueness requirements,
- actual query patterns,
- sorting patterns,
- lookup patterns.

Do **not** index every field speculatively.

---

## 51. MONGOOSE RULES

Use Mongoose consistently. Models must be strongly typed. Use appropriate:

- schema types
- indexes
- validation
- timestamps
- references where justified

Do **not** rely on implicit `any`.

---

## 52. DATA MODELING

Schemas must represent business concepts clearly. Keep future domains separated:

- Users
- Agencies
- Packages
- Leads
- Conversations
- Messages

Do **not** create a giant universal collection for unrelated domains.

---

## 53. DATABASE REFERENCES

Choose embedding vs references based on:

- query patterns
- data ownership
- update frequency
- document size
- consistency requirements

Do **not** blindly embed or normalize everything.

---

## 54. TRANSACTIONS

Do **not** use MongoDB transactions everywhere. Use them only where atomicity across multiple documents is genuinely required.

---

## 55. QUERY PERFORMANCE

Avoid:

- unnecessary queries
- N+1 queries
- loading huge collections into memory
- unbounded list endpoints

Use:

- pagination
- projection
- appropriate indexes
- limited fields
- efficient query patterns

---

## 56. PAGINATION

Future list endpoints must use pagination. Apply sensible server-side maximum limits. Never trust a client-provided limit blindly.

---

## 57. API QUERY LIMITS

When accepting `page`, `limit`, `sort`, `filter` — validate and constrain them. Never allow `limit=999999999`.

---

## 58. RESPONSE SIZE

Keep API responses reasonably small. Do **not** return unnecessary nested objects, duplicates, internal fields, or unused metadata. Paginate large datasets.

---

## 59. EXTERNAL INTEGRATIONS

Future integrations may include: email, storage, notifications, payment, analytics, maps.

Do **not** tightly couple business logic to vendor-specific implementations. Use abstractions **when they provide real value**. Do **not** create empty abstractions for hypothetical services.

---

## 60. EMAIL

Do **not** implement email now. When required, prefer a centralized email service.

---

## 61. STORAGE

Do **not** implement object storage now. When required, isolate the storage provider from business logic.

---

## 62. PAYMENTS

Do **not** implement payment functionality now. When eventually implemented:

- provider calls must be server-side,
- secrets must remain server-side,
- payment status must be verified server-side,
- webhooks must be authenticated and verified,
- frontend confirmation must never be treated as payment proof.

---

## 63. CHAT

Do **not** implement real-time chat infrastructure now. Do **not** install Socket.IO merely for future use. When chat is introduced, keep it a dedicated module.

---

## 64. REDIS

Do **not** install Redis now. Introduce it only when there is a real requirement (caching, distributed rate limiting, background jobs, sessions, real-time scaling).

---

## 65. QUEUES

Do **not** introduce BullMQ, RabbitMQ, Kafka, or any queue infrastructure until background processing is actually required.

---

## 66. MICROSERVICES

Do **not** create microservices. Do **not** split into `auth-service`, `agency-service`, `package-service`, `lead-service`, etc. Keep one modular backend.

---

## 67. CONTROLLER SIZE

Controllers must remain small. If a controller grows:

- move business logic → service,
- move persistence → repository,
- move validation → schemas / middleware.

---

## 68. SERVICE SIZE

Services must have clear responsibilities. Do **not** create giant services that mix unrelated domains.

---

## 69. UTILITY RULE

Before creating a utility:

1. Search existing utilities.
2. Determine whether the logic is truly reusable.
3. Determine whether it belongs to a feature instead.

Avoid a giant unrelated `utils.ts`.

---

## 70. SHARED CODE RULE

Shared code must genuinely be shared. Do **not** move feature-specific code into `shared/` for cleanliness. Shared modules must remain domain-neutral.

---

## 71. DEPENDENCY DIRECTION

```
Routes
 ↓
Controllers
 ↓
Services
 ↓
Repositories
 ↓
Database
```

Shared infrastructure may be used by these layers. Do **not** create circular dependencies.

---

## 72. BUSINESS LOGIC LOCATION

Business rules live primarily in services / domain logic:

- Can this agency publish a package?
- Can this customer create a lead?
- Can this agency view this lead?
- Can this admin approve this agency?

The frontend must **not** decide these.

---

## 73. AUTHORIZATION LOCATION

Authorization is backend-controlled. The frontend may hide UI for UX, but backend authorization is mandatory.

---

## 74. INPUT TRUST MODEL

Treat all external input as untrusted:

- body
- params
- query
- headers
- cookies
- tokens
- IDs
- files
- webhook payloads

Always validate and authorize.

---

## 75. WEBHOOK SECURITY

Future webhook endpoints must verify authenticity. Never trust a webhook merely because it comes from an expected URL. Do **not** implement webhooks now.

---

## 76. API DOCUMENTATION

Future API documentation must reflect the actual implementation. Never document endpoints that do not exist. Do **not** create extensive API documentation infrastructure during foundation setup unless required.

---

## 77. TESTING PHILOSOPHY

Never write tests. Do not create test files, test utilities, test configurations, or any testing-related code.

---

---

## 79. GRACEFUL SHUTDOWN

Handle `SIGTERM` and `SIGINT`. Shutdown must:

1. stop accepting new requests,
2. close HTTP server,
3. close MongoDB,
4. flush logs if necessary,
5. exit cleanly.

Do **not** terminate abruptly when graceful shutdown is possible.

---

## 80. APP VS SERVER

- `app.ts` → Express instance, middleware, routes, error handling.
- `server.ts` → configuration, database startup, server startup, shutdown.

This separation keeps concerns isolated.

---

## 81. HEALTH ENDPOINT

`GET /health` must be safe. Never expose secrets, credentials, environment variables, or internal paths.

---

## 82. API ROOT

`GET /api/v1` is a simple availability / version response. Do **not** place business logic here.

---

## 83. NOT FOUND HANDLER

Unknown routes return a consistent error:

```json
{
  "success": false,
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "The requested resource was not found."
  }
}
```

Do **not** expose internal route information.

---

## 84. NAMING CONVENTIONS

- Files: `kebab-case.ts`
- Classes / types: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

Avoid unclear abbreviations.

---

## 85. IMPORTS

Use configured TypeScript path aliases when appropriate. Avoid deep relative paths like `../../../../`. Avoid circular imports.

---

## 86. TYPE SAFETY

Use explicit types at important boundaries:

- configuration
- API input
- API output
- service interfaces
- repository operations
- database models
- external integrations

Do **not** use `any` to avoid designing the correct type.

---

## 87. ESLINT

ESLint errors are unacceptable. Do **not** disable rules because they are inconvenient. Avoid `eslint-disable` unless there is a legitimate documented reason. Fix the underlying code.

---

## 88. FORMATTING

Use one consistent formatting standard. Do **not** allow individual agents to introduce different styles. The repository configuration is authoritative.

---

## 89. COMMENTS

Comments should explain **why**, not restate code. Allowed:

- why something exists
- why a non-obvious decision was made
- security constraints
- important architectural decisions

Avoid huge comment blocks.

---

## 90. NO DEAD CODE

Do **not** leave unused files, unused imports, commented-out implementations, abandoned utilities, or fake placeholder services.

---

## 91. NO FAKE IMPLEMENTATION

Never create fake:

- database methods
- API endpoints
- authentication
- services
- repositories

If something is not implemented, leave it unimplemented or clearly mark it as future work.

---

## 92. NO SILENT FALLBACKS

Do **not** silently fall back to fake databases, mock users, hard-coded credentials, default admins, or fake API data in production code. Development mocks must be clearly separated from real application code.

---

## 93. PERFORMANCE

Performance must be considered in every backend feature. Prefer:

- efficient queries
- projections
- pagination
- intentional indexes
- minimal payloads
- asynchronous I/O

Do **not** optimize blindly. Measure real bottlenecks before introducing infrastructure.

---

## 94. CACHING

Do **not** introduce caching automatically. Introduce it only when there is a demonstrated performance requirement.

---

## 95. N+1 QUERY PROTECTION

When implementing list / detail features, consider whether loops create repeated database queries. Prefer efficient querying and batching.

---

## 96. PAGINATION

All potentially large collection endpoints must be paginated. Apply sensible server-side maximum limits.

---

## 97. DATABASE QUERY SAFETY

Never construct unsafe queries from raw user input. Validate query parameters. Use Mongoose's typed / query-safe mechanisms. Do **not** blindly pass arbitrary request objects into MongoDB operations.

---

## 98. REGEX / SEARCH SAFETY

Be careful with user-provided regex / search patterns. Do **not** allow arbitrary expensive regex operations without validation / limits.

---

## 99. RESOURCE LIMITS

Apply sensible limits on:

- request body size
- pagination size
- string lengths
- array lengths
- uploaded file sizes (when implemented)
- rate limits
- query complexity

Never allow unbounded user-controlled input.

---

## 100. API CONTRACT STABILITY

Once an API is consumed by the frontend, do **not** casually change:

- field names
- response structures
- status semantics
- error codes

without considering compatibility. Breaking changes must be intentional.

---

## 101. FRONTEND / BACKEND BOUNDARY

The frontend and backend are separate repositories. The backend exposes an API contract. Do **not** couple backend code to frontend internals. The backend must remain independently deployable.

---

## 102. DATABASE / FRONTEND BOUNDARY

The frontend must **never** depend on MongoDB schema details. The API is the contract. The backend may change internal database implementation as long as the API contract remains compatible.

---

## 103. API SECURITY PRINCIPLE

Assume a malicious client can:

- modify requests
- call endpoints manually
- skip frontend UI
- modify IDs
- modify roles
- modify prices
- replay requests
- send malformed payloads

Never trust the frontend.

---

## 104. ADMIN SECURITY

Future admin functionality requires stronger authorization. `role === "admin"` from a client-provided value is never sufficient. Admin operations must be fully authenticated and authorized server-side.

---

## 105. LEAD SECURITY

Leads may contain sensitive customer information. Future lead endpoints must implement:

- authentication
- authorization
- ownership checks
- minimal response fields
- audit considerations

Do **not** implement leads now.

---

## 106. PERSONAL DATA

Only collect / store data that is necessary for the product. Avoid logging personal data. For any future feature introducing personal information, consider: purpose, access control, retention, exposure, logging.

---

## 107. AUDITABILITY

For future sensitive operations (admin approvals, agency status changes, lead status changes, payment actions, permission changes) consider audit logging. Do **not** implement a full audit system now unless required.

---

## 108. SECURITY-FIRST CHANGE POLICY

Changes involving:

- authentication
- authorization
- credentials
- payments
- personal information
- file uploads
- external integrations

require additional security review. AI agents must **not** treat these as ordinary CRUD.

---

## 109. AI AGENT OPERATING PROCEDURE

Every AI coding agent **MUST** follow this workflow:

**STEP 1 — READ**
Read `TRAVORA_BACKEND_RULES.md` before changing anything.

**STEP 2 — INSPECT**
Inspect existing files, `package.json`, `tsconfig`, ESLint configuration, configuration files, the affected module, and existing patterns.

**STEP 3 — SEARCH**
Before creating a service, repository, middleware, utility, schema, model, or error class — search for existing equivalents.

**STEP 4 — UNDERSTAND**
Identify affected module, API boundary, database impact, security impact, validation requirements, authorization requirements, and performance implications.

**STEP 5 — PLAN**
Create a concise implementation plan.

**STEP 6 — IMPLEMENT**
Make the smallest clean change that solves the problem.

**STEP 7 — VALIDATE**
Run:

```bash
npm run typecheck
npm run lint
npm run build
```

**STEP 8 — SECURITY REVIEW**
Ask:

- Did this expose data?
- Did this trust client input?
- Did this bypass validation?
- Did this bypass authorization?
- Did this expose internal errors?
- Did this introduce a security-sensitive dependency?

**STEP 9 — ARCHITECTURE REVIEW**
Check module boundaries, dependency direction, duplication, unnecessary abstractions, database queries, response shape, error handling.

**STEP 10 — REPORT**
Report what changed, files changed, architecture decisions, security considerations, validation results, and remaining issues.

---

## 110. AI AGENT — DO NOT MODIFY GOVERNANCE

AI agents must **not** modify `TRAVORA_BACKEND_RULES.md` just to make an implementation easier.

If the implementation conflicts with the rules, **STOP** and explain:

```
Conflict:
Current rule:
Requested implementation:
Recommended solution:
```

Ask for explicit project-owner approval before changing the governance document.

---

## 111. EXPLICIT OVERRIDE

An explicit instruction from the project owner may override a rule. However, the AI agent must:

- Identify the rule being overridden.
- Explain the consequence if significant.
- Make only the requested exception.
- Avoid changing unrelated architecture.
- Not silently modify the rules document.

---

## 112. NEVER CHANGE ARCHITECTURE FOR CONVENIENCE

Do **not** replace a working pattern because another framework is more familiar, another library is easier, another architecture looks cleaner, or an AI model prefers it. Existing architecture must be respected. Architecture changes require a real technical reason.

---

## 113. REUSE BEFORE CREATE

Before creating a new error class, middleware, validator, repository, service, utility, or response formatter — search for existing implementations. Reuse or extend when appropriate.

---

## 114. SMALL CHANGES

Prefer incremental changes. When adding a feature:

- Do **not** rewrite unrelated modules.
- Do **not** refactor the entire backend.
- Do **not** rename dozens of files unnecessarily.

Change only what is required.

---

## 115. DATABASE MIGRATION SAFETY

MongoDB schema changes must be considered carefully. Do **not** make destructive changes casually. Never drop collections or data as part of normal development unless explicitly requested. Future migrations / backfills must be deliberate.

---

## 116. DESTRUCTIVE OPERATIONS

Never automatically execute destructive operations such as `dropDatabase()`, `deleteMany({})`, or `dropCollection()` against real environments. If a destructive action is necessary: explain it, verify the environment, require explicit approval.

---

## 117. PRODUCTION SAFETY

Production must have:

- secure secrets
- restricted CORS
- appropriate logging
- appropriate rate limiting
- secure cookies / tokens where applicable
- safe error responses
- proper database configuration
- appropriate environment variables

Never assume development configuration is suitable for production.

---

## 118. DEVELOPMENT SAFETY

Development conveniences must not become production behavior:

- debug logs
- mock users
- test credentials
- permissive CORS
- fake services

Keep them clearly environment-specific.

---

## 119. NO SECRET DEFAULTS

Never create dangerous defaults like:

```
JWT_SECRET=secret
ADMIN_PASSWORD=admin
DATABASE_PASSWORD=password
```

Even for convenience. Use explicit environment configuration.

---

## 120. API DOCUMENTATION HONESTY

Never claim an endpoint exists when it does not. Never document fake functionality. Documentation must reflect actual implementation.

---

## 121. CODE REVIEW STANDARD

Review every AI-generated change as if another senior engineer will maintain it for years. Ask:

- Would another developer understand this?
- Would another AI agent understand this?
- Is the security boundary obvious?
- Is the database behavior obvious?
- Is the API behavior predictable?
- Can this be extended?
- Is there unnecessary complexity?

---

## 122. DEFINITION OF DONE

A backend task is complete only when:

- [ ] Functionality works
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] Build passes
- [ ] Validation is implemented
- [ ] Authorization is implemented where required
- [ ] Sensitive data is protected
- [ ] API response is intentional
- [ ] Errors are handled centrally
- [ ] Database queries are reasonable
- [ ] Pagination exists where required
- [ ] No unnecessary dependency was added
- [ ] No secret is exposed
- [ ] No raw database object is unnecessarily returned
- [ ] No obvious security issue was introduced
- [ ] No obvious performance regression was introduced
- [ ] Architecture remains consistent
- [ ] Documentation is updated when appropriate

---

## 123. FINAL AGENT CHECKLIST

Before completing **any** backend task:

- [ ] Did I read `TRAVORA_BACKEND_RULES.md`?
- [ ] Did I inspect existing code first?
- [ ] Did I search for reusable existing code?
- [ ] Did I follow the modular architecture?
- [ ] Did I keep controllers thin?
- [ ] Did I put business logic in services?
- [ ] Did I keep database access controlled?
- [ ] Did I validate all untrusted input?
- [ ] Did I protect resource ownership?
- [ ] Did I consider authorization?
- [ ] Did I avoid returning raw database documents?
- [ ] Did I expose only required data?
- [ ] Did I use proper HTTP status codes?
- [ ] Did I use consistent error responses?
- [ ] Did I avoid leaking internal errors?
- [ ] Did I protect secrets?
- [ ] Did I avoid logging sensitive information?
- [ ] Did I consider rate limiting?
- [ ] Did I consider request-size limits?
- [ ] Did I consider database query performance?
- [ ] Did I use pagination where needed?
- [ ] Did I avoid N+1 queries?
- [ ] Did I avoid unnecessary dependencies?
- [ ] Did I avoid unnecessary abstractions?
- [ ] Did I preserve API compatibility?
- [ ] Did I run TypeScript?
- [ ] Did I run ESLint?
- [ ] Did I run the build?
- [ ] Did I perform a security review?
- [ ] Did I keep the change focused?

---

## 124. GOLDEN RULE

> **Build Travora as a secure product, not as a collection of endpoints.**

Every API, service, database model, middleware, validation rule, and architectural decision must protect the integrity of the system while remaining understandable and maintainable.

Security first. Data minimization always. Validate everything. Authorize everything that matters. Keep business logic modular. Keep the architecture simple until complexity is justified.

**Build for the current product, but do not block the future.**

---

*End of `TRAVORA_BACKEND_RULES.md` — the backend engineering constitution.*