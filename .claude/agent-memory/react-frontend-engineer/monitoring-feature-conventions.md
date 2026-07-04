---
name: monitoring-feature-conventions
description: Audit Log / Login Log feature module layout, role-gated shared-component-across-routes pattern, base-ui Select onValueChange typing gotcha
metadata:
  type: project
---

## Feature module

`src/features/monitoring/` (api/, components/, types/, index.ts) built for read-only Audit Log
and Login Log list pages. `AuditLog`/`LoginLog` entity types and `AuditEvent`/`LoginStatus` enums
already existed in `src/types/entities/audit-log.ts` (scaffolded ahead of time) — the feature's
local `types/index.ts` holds only feature-local filter interfaces (`AuditLogFilters`,
`LoginLogFilters`), following the same split used by `features/requests/types/index.ts`
(entity types from `@/types`, filters/payloads defined locally).

`useAuditLogs`/`useLoginLogs` in `api/audit-logs.ts` / `api/login-logs.ts` follow the exact
`usePurchaseOrders` shape: `keepPreviousData`, stable `[key, filters]` query key, typed filters
param defaulting to `{}`.

## Same list component reused across two role route trees

`AuditLogsList` (in `features/monitoring`) is rendered from THREE thin route pages:
`app/routes/procurement-officer/audit-logs.tsx`, `app/routes/procurement-officer/login-logs.tsx`
(login logs, procurement_officer only), and `app/routes/budget-officer/audit-logs.tsx` — same
component, no duplication, each route file is a one-line wrapper. This mirrors how
[[notifications-feature-conventions]] already established shared components rendered from
multiple role-specific route files. Nav entries were added as plain unconditional array entries
in `procurement-officer-layout.tsx` NAV and `budget-officer-layout.tsx` BUDGET_OFFICER_NAV
(no `hasRole` gating needed) because each layout is only ever rendered for its own root layout/role
— confirmed by reading `router.tsx`, no shared-layout-across-roles case exists in this app.

## base-ui Select onValueChange — don't pass a generically-typed setter directly

`SelectPrimitive`'s `onValueChange` callback type is `(value: string | null) => void`. A generic
helper like `handleChange<T>(setter: (v: T) => void) => (v: T) => void` CANNOT be passed directly
as `onValueChange={handleChange(setState)}` — TS's contravariant parameter checking rejects it
because `setState` only accepts `string`, not `string | null`. Always wrap inline instead:
`onValueChange={(val) => val && setState(val)}`. Plain `<Input onChange>` handlers don't have this
problem since you're calling the curried function yourself with a known-string value, not handing
it to a prop with its own stricter type.

**Why:** Hit this exact TS2345-shaped error while wiring the Audit Log event-type filter and the
Login Log status filter selects; fixed by inlining the null-check instead of reusing a shared
generic `handleFilterChange` helper for Select components specifically (kept the generic helper
for plain text/date `Input` filters, where it works fine).
**How to apply:** Any new filter UI using `components/ui/select.tsx` should wire `onValueChange`
inline with a null-guard, not through a generic setter-wrapping helper.

## TanStack Table new-component lint warning is expected, not a regression

Every component that calls `useReactTable()` produces one React Compiler ESLint warning
("Compilation Skipped: Use of incompatible library... react-hooks/incompatible-library") — this
is inherent to the hook, not a bug. Adding a new table component (e.g. `AuditLogsTable.tsx`,
`LoginLogsTable.tsx`) legitimately adds one warning each on top of the
[[procurement-chain-ui-patterns]] baseline (which already had 5: BacRequestsTable,
PurchaseOrdersTable, SupplierCreateForm's `watch()`, SuppliersTable, RequestsTable). When
diffing lint output against that baseline, expect +1 warning per new TanStack Table component
and do not try to suppress it.
