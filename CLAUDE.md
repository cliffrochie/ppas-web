# PPAS Web — Project Documentation

**PPAS** (Procurement and Purchase Acquisition System) is a role-based procurement web application built with React + Vite. It manages the full lifecycle of purchase requests — from submission by requesters through BAC review, budget approval, PPU processing, and final purchase order generation.

---

## Subagent Delegation Policy

For every task given in this project, first check whether a qualified subagent (from the available agent types) is capable of handling it. If a matching subagent exists, delegate the task to it rather than handling it directly.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | React 19 + Vite 8 |
| Language | TypeScript ~6 (strict) |
| Routing | React Router DOM v7 |
| Server state | TanStack Query v5 |
| Client state | Zustand v5 (persisted) |
| Forms | React Hook Form v7 + Zod v4 |
| UI components | Shadcn/ui + Tailwind CSS v4 |
| HTTP client | Axios v1 |
| Charts | ApexCharts + react-apexcharts |
| Notifications | Sonner (toast) |
| Testing | Vitest + Testing Library + MSW |

---

## Environment Variables

Defined in `.env` (copy from `.env.example`):

```
VITE_API_URL=http://localhost:8000/api/v1   # Laravel backend base URL
VITE_SENTRY_DSN=                            # Optional Sentry error tracking
```

The `VITE_API_URL` is read by `src/lib/api-client.ts` as the Axios `baseURL`. All feature API calls are relative to this base (e.g. `GET /purchase-requests` → `http://localhost:8000/api/v1/purchase-requests`).

> `.env` is git-ignored (`.env`, `.env.*`, except `.env.example`). Never commit real values — see `blueprint/dev-guidelines/security.md`.

---

## File Structure

```
ppas-web/
├── public/                         # Static assets (favicon, icons)
├── src/
│   ├── main.tsx                    # React root mount
│   ├── index.css                   # Tailwind base styles
│   ├── assets/                     # Images and SVG logos
│   │
│   ├── app/                        # App shell and routing
│   │   ├── index.tsx               # Renders <AppProvider> + <RouterProvider>
│   │   ├── provider.tsx            # Global providers: QueryClient, Toaster
│   │   ├── router.tsx              # All routes (see Routing section)
│   │   └── routes/                 # Thin route pages (lazy-loaded)
│   │       ├── landing.tsx         # Public landing page (/)
│   │       ├── not-found.tsx       # 404 catch-all (*)
│   │       ├── forbidden.tsx       # 403 page (/403)
│   │       ├── auth/
│   │       │   ├── login.tsx
│   │       │   └── register.tsx
│   │       ├── app/
│   │       │   ├── root.tsx        # Shared dashboard shell + ErrorBoundary
│   │       │   └── dashboard.tsx   # /dashboard (general)
│   │       ├── requester/
│   │       │   ├── root.tsx        # Requester layout + ErrorBoundary
│   │       │   ├── requests.tsx    # /requests
│   │       │   ├── requests-create.tsx  # /requests/new
│   │       │   ├── requests-detail.tsx  # /requests/:id
│   │       │   └── requests-edit.tsx    # /requests/:id/edit
│   │       ├── bac/
│   │       │   ├── root.tsx        # BAC layout + ErrorBoundary
│   │       │   ├── dashboard.tsx   # /bac/dashboard
│   │       │   ├── requests.tsx    # /bac/requests
│   │       │   └── requests-detail.tsx  # /bac/requests/:id
│   │       ├── budget-officer/
│   │       │   ├── root.tsx        # Budget Officer layout + ErrorBoundary
│   │       │   ├── dashboard.tsx   # /budget-officer/dashboard
│   │       │   ├── requests.tsx    # /budget-officer/requests
│   │       │   ├── requests-detail.tsx
│   │       │   └── audit-logs.tsx  # /budget-officer/audit-logs
│   │       └── procurement-officer/
│   │           ├── root.tsx        # Procurement Officer layout + ErrorBoundary
│   │           ├── dashboard.tsx
│   │           ├── requests.tsx / requests-detail.tsx
│   │           ├── purchase-orders.tsx / purchase-orders-detail.tsx
│   │           ├── suppliers.tsx / suppliers-create.tsx / suppliers-detail.tsx / suppliers-edit.tsx
│   │           ├── rfqs.tsx / rfqs-detail.tsx
│   │           ├── abstracts.tsx / abstracts-detail.tsx
│   │           ├── bac-resolutions.tsx / bac-resolutions-detail.tsx
│   │           ├── notices-of-award.tsx / notices-of-award-detail.tsx
│   │           ├── audit-logs.tsx
│   │           └── login-logs.tsx
│   │
│   ├── features/                   # Feature modules (one per domain/role)
│   │   ├── auth/
│   │   │   ├── api/auth.ts         # Login, logout, register mutations
│   │   │   ├── components/         # LoginForm, RegisterForm
│   │   │   ├── schemas/authSchema.ts  # Zod schemas (loginSchema, registerSchema)
│   │   │   ├── types/index.ts      # LoginCredentials, RegisterPayload, etc.
│   │   │   └── index.ts
│   │   ├── requests/               # Requester feature (purchase request CRUD)
│   │   │   ├── api/
│   │   │   │   ├── requests.ts     # CRUD + items + attachments + status histories
│   │   │   │   ├── categories.ts   # Reference data (stale 5 min)
│   │   │   │   └── users.ts        # useUsersInfinite (end-user picker)
│   │   │   ├── components/         # RequestList, RequestDetail, CreateRequestForm, etc.
│   │   │   ├── schemas/requestSchema.ts  # createRequestSchema
│   │   │   ├── types/index.ts      # Request, RequestFilters, CreateRequestPayload
│   │   │   └── index.ts
│   │   ├── bac/
│   │   │   ├── api/requests.ts     # useUpdateRequestStatus (PATCH /purchase-requests/:id)
│   │   │   ├── components/         # BacDashboard, BacRequestList, BacRequestDetail
│   │   │   └── index.ts
│   │   ├── budget-officer/
│   │   │   ├── api/requests.ts     # useUpdateRequestStatus (PATCH /purchase-requests/:id)
│   │   │   ├── components/         # BudgetOfficerRequestDetail
│   │   │   └── index.ts
│   │   ├── procurement-officer/
│   │   │   ├── api/               # requests, purchase-orders, suppliers, rfqs, procurement
│   │   │   ├── components/        # ProcurementRequestDetail, PurchaseOrders*, Suppliers*,
│   │   │   │                      #   Rfqs*, Abstracts*, BacResolutions*, NoticesOfAward*
│   │   │   ├── schemas/           # rfqSchema, abstractSchema, bacResolutionSchema,
│   │   │   │                      #   noticeOfAwardSchema, supplierSchema
│   │   │   └── index.ts
│   │   ├── dashboard/             # useDashboard (GET /dashboard) — shared KPI feed
│   │   │   ├── api/dashboard.ts
│   │   │   └── index.ts
│   │   ├── monitoring/           # Audit log + login log views
│   │   │   ├── api/               # audit-logs.ts, login-logs.ts
│   │   │   ├── components/        # AuditLogs*, LoginLogs*
│   │   │   ├── types/index.ts
│   │   │   └── index.ts
│   │   └── notifications/
│   │       ├── api/notifications.ts   # useNotifications, useMarkNotificationRead
│   │       ├── components/NotificationBell.tsx
│   │       └── index.ts
│   │
│   ├── components/
│   │   ├── ui/                     # Shadcn primitive components (badge, button, etc.)
│   │   ├── layouts/                # Role-specific layout shells (sidebar wiring)
│   │   │   ├── app-sidebar-layout.tsx
│   │   │   ├── auth-layout.tsx
│   │   │   ├── requester-layout.tsx
│   │   │   ├── budget-officer-layout.tsx
│   │   │   ├── procurement-officer-layout.tsx
│   │   │   ├── content-layout.tsx
│   │   │   ├── dashboard-layout.tsx
│   │   │   └── index.ts
│   │   └── errors/
│   │       └── ErrorBoundary.tsx
│   │
│   ├── lib/                        # Core integration layer
│   │   ├── api-client.ts           # Axios instance + interceptors (see API Client section)
│   │   ├── auth.tsx                # <ProtectedRoute> + <RoleProtectedRoute>
│   │   ├── authorization.tsx       # useAuthorization() hook (role checks)
│   │   └── react-query.ts          # QueryClient config
│   │
│   ├── stores/
│   │   └── authStore.ts            # Zustand auth store (persisted to localStorage)
│   │
│   ├── types/
│   │   ├── index.ts                # ApiResponse, PaginatedResponse, ApiError, utilities
│   │   └── entities/               # One file per database entity (see Entities section)
│   │       ├── index.ts            # Re-exports everything
│   │       ├── user.ts
│   │       ├── role.ts
│   │       ├── office.ts
│   │       ├── category.ts
│   │       ├── purchase-request.ts
│   │       ├── purchase-order.ts
│   │       ├── rfq.ts
│   │       ├── procurement.ts      # AbstractOfQuotation, BacResolution, NoticeOfAward
│   │       ├── supplier.ts
│   │       ├── notification.ts
│   │       └── audit-log.ts
│   │
│   ├── config/
│   │   └── index.ts                # Typed env var exports
│   ├── hooks/
│   │   └── index.ts
│   ├── utils/
│   │   └── index.ts
│   └── testing/
│       ├── setup.ts                # Vitest + jest-dom setup
│       └── utils.tsx               # Custom render with providers
│
├── .env                            # Local env — git-ignored (see security.md)
├── .env.example                    # Env template (committed)
├── components.json                 # Shadcn config
├── vite.config.ts
├── tsconfig.app.json
└── package.json
```

---

## Integration Layer (Backend Developer Reference)

### API Client — `src/lib/api-client.ts`

Single Axios instance exported as `api`. All feature API files import from here.

```ts
import { api } from '@/lib/api-client';
```

**Configuration:**
- `baseURL`: `VITE_API_URL` (e.g. `http://localhost:8000/api/v1`)
- `headers`: `Accept: application/json`, `Content-Type: application/json`
- `withCredentials`: `false` (token-based, not cookie-based)

**Request interceptor** — automatically injects the `Authorization: Bearer <token>` header from the Zustand auth store on every request.

**Response interceptor** — global error handling:

| HTTP Status | Frontend Behavior |
|---|---|
| `401` | Clears auth store, redirects to `/login` |
| `403` | Shows `error.response.data.message` as a toast |
| `429` | Shows rate-limit toast with `Retry-After` seconds if provided |
| `500` | Shows `error.response.data.message` as a toast |

---

### Response Envelope

All API responses must conform to one of these two shapes. These types live in `src/types/index.ts`.

**Single resource:**
```ts
interface ApiResponse<T> {
  data: T;
  message: string;
  errors: null;
}
```

**Paginated list:**
```ts
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message: string;
  errors: null;
}
```

**Validation error (422):**
```ts
interface ApiError {
  data: null;
  message: string;
  errors: Record<string, string[]> | null;  // field -> ["error message"]
}
```

The helper `isApiValidationError(error)` in `src/types/index.ts` narrows the error type for 422 form handling.

---

### Authentication Flow

**Login** (`POST /auth/login`)
- Payload: `{ email: string, password: string }` (`LoginCredentials`)
- Response: `ApiResponse<{ token: string, user: User }>`
- On success: `useAuthStore.setAuth(token, user)`, then `useLogin` navigates by `user.role.name`:
  `procurement_officer` → `/procurement-officer/dashboard`, `budget_officer` → `/budget-officer/dashboard`,
  `bac_secretariat` → `/bac/dashboard`, `requester` (and any other) → `/requests`

**Logout** (`DELETE /auth/logout`)
- No payload; the Bearer token in the request header identifies the session
- On success (or error): clears Zustand store and QueryClient cache, navigates to `/login`

**Register** (`POST /auth/register`)
- Payload: `RegisterPayload` (see `src/features/auth/types/index.ts`)
- Response: `ApiResponse<{ message: string }>`

**Auth Store** (`src/stores/authStore.ts`):
- Persisted to `localStorage` under the key `auth-storage`
- `hasHydrated` flag prevents flash-of-unauthenticated-content on page load
- `user.role.name` (a snake_case slug — see Role-to-Route Mapping) drives all UI access checks

---

### Route Protection

`src/lib/auth.tsx` exports two guards:

- **`<ProtectedRoute>`** — waits for `hasHydrated`, then redirects to `/login` if not authenticated. Wraps every authenticated route.
- **`<RoleProtectedRoute allowedRoles={[...]}>`** — nested inside `<ProtectedRoute>`; redirects to `/403` if `user.role.name` is not in `allowedRoles`.

```
/  /login  /register  /403  *(404)   →  public
/dashboard                            →  ProtectedRoute
/requests/*                           →  ProtectedRoute + RoleProtectedRoute ['requester']
/bac/*                                →  ProtectedRoute + RoleProtectedRoute ['bac_secretariat']
/budget-officer/*                     →  ProtectedRoute + RoleProtectedRoute ['budget_officer']
/procurement-officer/*                →  ProtectedRoute + RoleProtectedRoute ['procurement_officer']
```

Role checks use `useAuthorization()` from `src/lib/authorization.tsx`:

```ts
const { hasRole } = useAuthorization();
if (hasRole(['bac_secretariat'])) { ... }
```

`hasRole` compares against `user.role.name` on the `User` returned by the login endpoint. UI role checks are UX only — the backend remains authoritative.

---

## API Endpoints Consumed

All paths are relative to `VITE_API_URL` (e.g. `/api/v1`).

### Auth
| Method | Path | Feature file |
|---|---|---|
| `POST` | `/auth/login` | `features/auth/api/auth.ts` |
| `DELETE` | `/auth/logout` | `features/auth/api/auth.ts` |
| `POST` | `/auth/register` | `features/auth/api/auth.ts` |

> The backend resources are flat top-level collections (`/purchase-requests`, `/pr-attachments`,
> `/purchase-request-items`, `/pr-status-histories`) — child records carry the parent id in the
> body/params, not the URL path.

### Purchase Requests (Requester)
| Method | Path | Hook | Notes |
|---|---|---|---|
| `GET` | `/purchase-requests` | `useRequests(filters)` | Paginated; `search`, `page`, `per_page`, `sort_by`, `sort_dir` |
| `GET` | `/purchase-requests/:id` | `useRequest(id)` | `PurchaseRequest` with eager relations |
| `POST` | `/purchase-requests` | `useCreateRequest()` | `CreateRequestPayload` (no inline `items`) |
| `PATCH` | `/purchase-requests/:id` | `useUpdateRequest(id)` | `UpdatePurchaseRequestPayload` |
| `POST` | `/purchase-request-items` | `useCreatePurchaseRequestItem()` | one call per line item, after the PR exists |
| `DELETE` | `/purchase-request-items/:itemId` | `requestsApi.deleteItem()` | |
| `POST` | `/pr-attachments` | `requestsApi.uploadAttachment()` | `multipart/form-data`; `purchase_request_id`, `file`, `type` |
| `DELETE` | `/pr-attachments/:attachmentId` | `requestsApi.deleteAttachment()` | |
| `GET` | `/pr-status-histories` | `useRequestStatusHistories(prId)` | filtered by `purchase_request_id` |

### Purchase Request Status Updates (BAC / Budget Officer / Procurement Officer)
| Method | Path | Hook | Notes |
|---|---|---|---|
| `PATCH` | `/purchase-requests/:id` | `useUpdateRequestStatus(id)` | `UpdatePrStatusPayload` — `{ status, remarks?, alobs_number? }` |

Each role has its own `api/requests.ts` with an identically-named `useUpdateRequestStatus` hook hitting
the same endpoint. The backend decides which transitions are valid per role.

### Categories (Reference Data)
| Method | Path | Hook | Notes |
|---|---|---|---|
| `GET` | `/categories` | `useCategories()` | `Category[]`; `staleTime` 5 min |

### Users (end-user picker)
| Method | Path | Hook | Notes |
|---|---|---|---|
| `GET` | `/users` | `useUsersInfinite(search)` | infinite scroll; used by request/RFQ forms |

### Suppliers (Procurement Officer)
| Method | Path | Hook | Notes |
|---|---|---|---|
| `GET` | `/suppliers` / `/suppliers/:id` | `useSuppliers` / `useSupplier` | |
| `POST` | `/suppliers` | `useCreateSupplier()` | `multipart/form-data` |
| `PATCH` | `/suppliers/:id` | `useUpdateSupplier(id)` | |
| `POST` | `/supplier-documents` | `useUploadSupplierDocument()` | `multipart/form-data` |

### Purchase Orders (Procurement Officer)
| Method | Path | Hook | Notes |
|---|---|---|---|
| `GET` | `/purchase-orders` / `/purchase-orders/:id` | `usePurchaseOrders` / `usePurchaseOrder` | Paginated list; `purchase_request_id` filter supported |
| `POST` | `/purchase-orders` | `useGeneratePurchaseOrder(prId)` | `{ purchase_request_id, prepared_by_id }` |
| `PATCH` | `/purchase-orders/:id` | `useUpdatePoStatus(id)` | `{ status: PurchaseOrderStatus }` |

### Procurement chain (Procurement Officer) — `rfqs.ts`, `procurement.ts`
| Method | Path | Notes |
|---|---|---|
| `GET/POST/PATCH/DELETE` | `/rfqs`, `/rfqs/:id` | RFQ CRUD; `POST /rfqs/:id` for multipart update-with-file |
| `GET/POST/PATCH/DELETE` | `/rfq-items`, `/rfq-items/:id` | RFQ line items (flat; `rfq_id` in body) |
| `GET/POST/PATCH/DELETE` | `/canvass-responses`, `/canvass-responses/:id` | per supplier per RFQ item |
| `GET/POST/PATCH/DELETE` | `/abstracts-of-quotation`, `/abstracts-of-quotation/:id` | AOQ; `POST /:id` for multipart update |
| `GET/POST/PATCH/DELETE` | `/bac-resolutions`, `/bac-resolutions/:id` | BAC resolution; `POST /:id` for multipart update |
| `GET/POST/PATCH/DELETE` | `/notices-of-award`, `/notices-of-award/:id` | NOA; `POST /:id` for multipart update |

### Dashboard / Monitoring / Notifications
| Method | Path | Hook | Notes |
|---|---|---|---|
| `GET` | `/dashboard` | `useDashboard(filters)` | KPI + chart feed (`features/dashboard`) |
| `GET` | `/audit-logs` | `useAuditLogs(filters)` | `features/monitoring` |
| `GET` | `/login-logs` | `useLoginLogs(filters)` | `features/monitoring` |
| `GET` | `/notifications` | `useNotifications(filters)` | `features/notifications` |
| `PATCH` | `/notifications/:id/mark-read` | `useMarkNotificationRead()` | |

---

## Entity Types Reference

All entity types live in `src/types/entities/`. Import via `@/types`.

### `PurchaseRequest` — `purchase-request.ts`

Core entity. Has a 16-step lifecycle tracked by `status` and an immutable `PrStatusHistory` table.

**Status lifecycle (`PurchaseRequestStatus`):**
```
draft → submitted → under_review → returned
                              ↓
                   for_budget_approval → disapproved
                              ↓
                    budget_approved → forwarded_to_ppu → pr_prepared → pr_approved
                              ↓
                    rfq_prepared → canvassing → abstract_prepared
                              ↓
                    bac_resolution_noa → po_prepared → completed
```

Key nullable fields and when they are populated:
- `rf_number` — set by backend on `submitted` transition (format: `RF-YYYY-NNN`)
- `pr_number` — set by backend on `pr_prepared` transition
- `alobs_number` / `fund_source` — set during `budget_approved` transition by Budget Officer

### `PurchaseOrder` — `purchase-order.ts`

Created by Procurement Officer after the PR reaches `po_prepared` status.

**Status lifecycle (`PurchaseOrderStatus`):**
```
draft → for_signature → signed → acknowledged → for_completion → completed
                                                              ↓
                                                           failed
```

### `Rfq` — `rfq.ts`

Request for Quotation. Created by PPU. Contains `RfqItem[]` linked to `PurchaseRequestItem` records and `CanvassResponse[]` per item per supplier.

### `AbstractOfQuotation`, `BacResolution`, `NoticeOfAward` — `procurement.ts`

Sequential procurement documents. All are 1:1 relations in a chain:
`RFQ → AbstractOfQuotation → BacResolution → NoticeOfAward`

### `Supplier` — `supplier.ts`

Vendor/supplier registry managed by Procurement Officer. Includes performance metrics (`on_time_delivery_rate`, `quality_rate`, `total_orders`, `total_value`).

### `User` — `user.ts`

Always has a `role` relation (eager-loaded by login endpoint). Role name drives all UI access control.

### `AuditLog` / `LoginLog` — `audit-log.ts`

- `AuditLog` — polymorphic field-level change log (any model)
- `LoginLog` — authentication attempt log (separate from audit trail)

---

## Role-to-Route Mapping

`role.name` slugs are snake_case — these exact strings are what `RoleProtectedRoute` /
`hasRole()` check.

| `role.name` | Root path | Key capabilities |
|---|---|---|
| `requester` | `/requests` | Create, view, edit draft PRs; upload attachments |
| `bac_secretariat` | `/bac` | View PRs, advance/return status |
| `budget_officer` | `/budget-officer` | View PRs, approve/disapprove budget (`alobs_number`, `fund_source`); audit logs |
| `procurement_officer` | `/procurement-officer` | View PRs; purchase orders, suppliers, RFQs, AOQ, BAC resolutions, NOA; audit/login logs |

---

## Adding a New Feature

When adding a new feature module, follow this pattern:

```
src/features/<feature-name>/
├── api/
│   └── <resource>.ts        # API service object + TanStack Query hooks (no useQuery/useMutation in components)
├── components/
│   └── <Component>.tsx      # Feature UI components
├── schemas/
│   └── <entity>Schema.ts    # Zod schemas for this feature's forms (not inline in components)
├── types/
│   └── index.ts             # Feature-local types (payload shapes, filters)
└── index.ts                 # Public barrel export — required; cross-feature imports go through this only
```

Then add the route in `src/app/router.tsx` (lazy import + route entry inside `<ProtectedRoute>` / `<RoleProtectedRoute>`), and the corresponding thin page file in `src/app/routes/<role>/<page>.tsx`.

The authoritative rules live in `blueprint/dev-guidelines/` (see `frontend.md`, `typescript.md`, `conventions.md`, `api-contract.md`). This file is the project-specific map; the blueprint wins on any conflict.

Entity types that are shared across features belong in `src/types/entities/` with a re-export in `src/types/entities/index.ts`.

---

## Behavioral Guidelines (Karpathy-Inspired)

Source: [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills). Bias toward caution over speed on non-trivial work; use judgment on trivial ones (typo fixes, obvious one-liners).

### 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If 200 lines could be 50, rewrite it.

Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

Touch only what you must. Clean up only your own mess.
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that YOUR changes made unused; don't remove pre-existing dead code unless asked.

Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

Define success criteria. Loop until verified.
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan with a verification check per step.
