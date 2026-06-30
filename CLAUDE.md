# PPAS Web — Project Documentation

**PPAS** (Procurement and Purchase Acquisition System) is a role-based procurement web application built with React + Vite. It manages the full lifecycle of purchase requests — from submission by requesters through BAC review, budget approval, PPU processing, and final purchase order generation.

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

The `VITE_API_URL` is read by `src/lib/api-client.ts` as the Axios `baseURL`. All feature API calls are relative to this base (e.g. `GET /requests` → `http://localhost:8000/api/v1/requests`).

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
│   │       ├── not-found.tsx       # 404 catch-all
│   │       ├── auth/
│   │       │   ├── login.tsx
│   │       │   └── register.tsx
│   │       ├── app/
│   │       │   ├── root.tsx        # Shared dashboard shell layout
│   │       │   └── dashboard.tsx   # /dashboard (general)
│   │       ├── requester/
│   │       │   ├── root.tsx        # Requester sidebar layout
│   │       │   ├── requests.tsx    # /requests
│   │       │   ├── requests-create.tsx  # /requests/new
│   │       │   ├── requests-detail.tsx  # /requests/:id
│   │       │   └── requests-edit.tsx    # /requests/:id/edit
│   │       ├── bac/
│   │       │   ├── root.tsx        # BAC sidebar layout
│   │       │   ├── dashboard.tsx   # /bac/dashboard
│   │       │   ├── requests.tsx    # /bac/requests
│   │       │   └── requests-detail.tsx  # /bac/requests/:id
│   │       ├── budget-officer/
│   │       │   ├── root.tsx        # Budget Officer sidebar layout
│   │       │   ├── dashboard.tsx   # /budget-officer/dashboard
│   │       │   ├── requests.tsx    # /budget-officer/requests
│   │       │   └── requests-detail.tsx
│   │       └── procurement-officer/
│   │           ├── root.tsx        # Procurement Officer sidebar layout
│   │           ├── dashboard.tsx   # /procurement-officer/dashboard
│   │           ├── requests.tsx    # /procurement-officer/requests
│   │           ├── requests-detail.tsx
│   │           ├── purchase-orders.tsx        # /procurement-officer/purchase-orders
│   │           ├── purchase-orders-detail.tsx
│   │           ├── suppliers.tsx              # /procurement-officer/suppliers
│   │           ├── suppliers-create.tsx
│   │           ├── suppliers-detail.tsx
│   │           └── suppliers-edit.tsx
│   │
│   ├── features/                   # Feature modules (one per domain/role)
│   │   ├── auth/
│   │   │   ├── api/auth.ts         # Login, logout, register mutations
│   │   │   ├── components/         # LoginForm, RegisterForm
│   │   │   ├── schemas/authSchema.ts  # Zod validation schemas
│   │   │   ├── types/index.ts      # LoginCredentials, RegisterPayload, etc.
│   │   │   └── index.ts
│   │   ├── requests/               # Requester feature (purchase request CRUD)
│   │   │   ├── api/
│   │   │   │   ├── requests.ts     # CRUD + attachment upload hooks
│   │   │   │   └── categories.ts   # Reference data (stale 5 min)
│   │   │   ├── components/         # RequestList, RequestDetail, CreateRequestForm, etc.
│   │   │   ├── types/index.ts      # Request, RequestFilters, CreateRequestPayload
│   │   │   └── index.ts
│   │   ├── bac/
│   │   │   ├── api/requests.ts     # useUpdateRequestStatus (PATCH /requests/:id/status)
│   │   │   └── components/         # BacDashboard, BacRequestList, BacRequestDetail
│   │   ├── budget-officer/
│   │   │   ├── api/requests.ts     # useUpdateRequestStatus (PATCH /requests/:id/status)
│   │   │   └── components/         # BudgetOfficerRequestDetail
│   │   └── procurement-officer/
│   │       ├── api/
│   │       │   ├── requests.ts     # useUpdateRequestStatus (PATCH /requests/:id/status)
│   │       │   ├── purchase-orders.ts  # PO list, detail, status update
│   │       │   └── suppliers.ts    # Supplier CRUD (multipart create)
│   │       ├── components/         # ProcurementRequestDetail, PurchaseOrders*, Suppliers*
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
│   │   ├── auth.tsx                # <ProtectedRoute> component
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
├── .env                            # Local env (gitignored)
├── .env.example                    # Env template
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
  errors: Record<string, string[]>;  // field -> ["error message"]
}
```

The helper `isApiValidationError(error)` in `src/types/index.ts` narrows the error type for 422 form handling.

---

### Authentication Flow

**Login** (`POST /auth/login`)
- Payload: `{ identifier: string, password: string }` — `identifier` accepts either username or email
- Response: `ApiResponse<{ token: string, user: User }>`
- On success: token and user object are stored in Zustand (`useAuthStore.setAuth(token, user)`)
- Frontend then navigates to `/requests`

**Logout** (`DELETE /auth/logout`)
- No payload required; the Bearer token in the request header identifies the session
- On success (or error): clears Zustand store and QueryClient cache, navigates to `/login`

**Register** (`POST /auth/register`)
- Payload: `RegisterPayload` (see `src/features/auth/types/index.ts`)
- Response: `ApiResponse<{ message: string }>`

**Auth Store** (`src/stores/authStore.ts`):
- Persisted to `localStorage` under the key `auth-storage`
- `hasHydrated` flag prevents flash-of-unauthenticated-content on page load
- `user.role.name` is used for role-based access checks

---

### Route Protection

`<ProtectedRoute>` in `src/lib/auth.tsx` wraps all authenticated routes.

```
GET /login  →  public
GET /register  →  public
GET /dashboard  →  ProtectedRoute
GET /requests/*  →  ProtectedRoute
GET /bac/*  →  ProtectedRoute
GET /budget-officer/*  →  ProtectedRoute
GET /procurement-officer/*  →  ProtectedRoute
```

Role-level access control uses `useAuthorization()` from `src/lib/authorization.tsx`:

```ts
const { hasRole } = useAuthorization();
if (hasRole(['BAC Secretary'])) { ... }
```

The `role.name` string checked against the `role` relation on the `User` object returned by the login endpoint.

---

## API Endpoints Consumed

All paths are relative to `VITE_API_URL` (e.g. `/api/v1`).

### Auth
| Method | Path | Feature file |
|---|---|---|
| `POST` | `/auth/login` | `features/auth/api/auth.ts` |
| `DELETE` | `/auth/logout` | `features/auth/api/auth.ts` |
| `POST` | `/auth/register` | `features/auth/api/auth.ts` |

### Purchase Requests (Requester)
| Method | Path | Hook | Notes |
|---|---|---|---|
| `GET` | `/requests` | `useRequests(filters)` | Paginated; supports `search`, `page`, `per_page`, `sort_by`, `sort_dir` |
| `GET` | `/requests/:id` | `useRequest(id)` | Returns `PurchaseRequest` with eager relations |
| `POST` | `/requests` | `useCreateRequest()` | `CreateRequestPayload` |
| `PATCH` | `/requests/:id` | `useUpdateRequest(id)` | `UpdatePurchaseRequestPayload` |
| `POST` | `/requests/:id/attachments` | `requestsApi.uploadAttachment()` | `multipart/form-data`; fields: `file`, `type` |
| `DELETE` | `/requests/:id/attachments/:attachmentId` | `requestsApi.deleteAttachment()` | |

### Purchase Request Status Updates (BAC / Budget Officer / Procurement Officer)
| Method | Path | Hook | Notes |
|---|---|---|---|
| `PATCH` | `/requests/:id/status` | `useUpdateRequestStatus(id)` | Payload: `{ status, remarks?, alobs_number? }` |

All three roles (BAC, Budget Officer, Procurement Officer) call the same endpoint. The backend determines which transitions are valid per role.

### Categories (Reference Data)
| Method | Path | Hook | Notes |
|---|---|---|---|
| `GET` | `/categories` | `useCategories()` | Returns `Category[]`; cached 5 minutes |

### Suppliers (Procurement Officer)
| Method | Path | Hook | Notes |
|---|---|---|---|
| `GET` | `/suppliers` | `useSuppliers(filters)` | Paginated |
| `GET` | `/suppliers/:id` | `useSupplier(id)` | |
| `POST` | `/suppliers` | `useCreateSupplier()` | `multipart/form-data` (FormData) |
| `PATCH` | `/suppliers/:id` | `useUpdateSupplier(id)` | `Partial<CreateSupplierPayload>` |

### Purchase Orders (Procurement Officer)
| Method | Path | Hook | Notes |
|---|---|---|---|
| `GET` | `/purchase-orders` | `usePurchaseOrders(filters)` | Paginated |
| `GET` | `/purchase-orders/:id` | `usePurchaseOrder(id)` | |
| `PATCH` | `/purchase-orders/:id/status` | `useUpdatePoStatus(id)` | Payload: `{ status: PurchaseOrderStatus, remarks? }` |

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

| Role | Root path | Key capabilities |
|---|---|---|
| Requester | `/requests` | Create, view, edit draft PRs; upload attachments |
| BAC Secretary | `/bac` | View PRs, advance/return status |
| Budget Officer | `/budget-officer` | View PRs, approve/disapprove budget (`alobs_number`, `fund_source`) |
| Procurement Officer | `/procurement-officer` | View PRs, manage purchase orders and suppliers |

---

## Adding a New Feature

When adding a new feature module, follow this pattern:

```
src/features/<feature-name>/
├── api/
│   └── <resource>.ts     # API functions + TanStack Query hooks
├── components/
│   └── <Component>.tsx   # Feature UI components
├── types/
│   └── index.ts          # Feature-local types (payload shapes, filters)
└── index.ts              # Public barrel export
```

Then add the route in `src/app/router.tsx` (lazy import + route entry inside `<ProtectedRoute>`), and the corresponding thin page file in `src/app/routes/<role>/<page>.tsx`.

Entity types that are shared across features belong in `src/types/entities/` with a re-export in `src/types/entities/index.ts`.
