---
name: purchase-request-contract-fix
description: Purchase Requests ("Requests") feature contract audit fixed 2026-07-04 - real endpoint paths, item/attachment/status-history creation patterns, requester_id-not-name field
metadata:
  type: project
---

## What was wrong and is now fixed (2026-07-04)

The entire Purchase Requests feature (`src/features/requests/**`, plus the BAC/Budget
Officer/Procurement Officer status-update files that share the same PR resource) was built
against an imagined backend contract. Fixed by cross-checking every relevant Laravel
FormRequest/Controller/Resource in `../ppas-api` directly. Full original findings are in
`/home/mananap/.claude/projects/-home-mananap-Development-ppas-ppas-web/memory/backend-api-contract-reference.md`.

Key corrected facts, now reflected in code:
- Base resource is `/purchase-requests`, not `/requests`. Status transitions (BAC/Budget
  Officer/Procurement Officer) go through the SAME `PATCH /purchase-requests/{id}` — there is no
  `/status` sub-route, despite `useUpdateRequestStatus` being duplicated per-role in
  `features/{bac,budget-officer,procurement-officer}/api/requests.ts`.
- There is no `end_user_name` field anywhere on `PurchaseRequest`. The real FK is
  `requester_id: number` (must resolve to a real `users.id`). `CreateRequestForm.tsx`'s
  `EndUserCombobox` now stores the picked user's **id** as the RHF value and tracks the
  display name in separate local state (`requesterName`), seeded from `request.requester` in
  edit mode.
- `PurchaseRequest` has no `items` field on create/update — line items are created individually
  via `POST /purchase-request-items` (`purchase_request_id`, `item_description`,
  `unit_of_measure`, `quantity`, `unit_cost`, `total_cost` — all required) AFTER the parent PR
  exists, mirroring the existing attachment-upload pattern (create parent → get id → attach
  children). `useCreatePurchaseRequestItem` was added to `features/requests/api/requests.ts` for
  this.
- Edit-mode item reconciliation uses **delete-all-then-recreate** (not per-row diffing): every
  existing `request.items[].id` is `DELETE /purchase-request-items/{id}`'d, then the full current
  form list is re-POSTed. Chosen deliberately as the simpler, still-correct fallback explicitly
  sanctioned when per-row id-tracking would add complexity disproportionate to the win — no
  pushback received on this choice.
- `/pr-attachments` is a flat top-level resource (not nested under `/purchase-requests/:id/`).
  Upload requires `purchase_request_id` in the FormData body; delete is
  `DELETE /pr-attachments/{id}` with no request-id in the path at all.
- `PrStatusHistory` ("Request Approval Chain" timeline UI in `RequestDetail.tsx`,
  `BacRequestDetail.tsx`, `BudgetOfficerRequestDetail.tsx`, `ProcurementRequestDetail.tsx`) is a
  separate read-only resource (`GET /pr-status-histories?purchase_request_id=X`), NOT embedded on
  `PurchaseRequestResource`. Added `useRequestStatusHistories(purchaseRequestId)` to
  `features/requests/api/requests.ts`; every consuming Detail component now calls this hook
  itself and threads `histories` down as a prop to its `ApprovalChain`/review-panel
  subcomponents, rather than reading a `request.status_histories` field that never existed on
  the real API response (was always silently falling back to `[]`).
- `PurchaseRequest` has no `purchase_order` relation either. `ProcurementRequestDetail.tsx` now
  has a small local `usePurchaseOrderForRequest(requestId, enabled)` hook (inline in that file,
  using the raw `api` client directly) that filters `GET /purchase-orders?purchase_request_id=X`
  — added inline rather than touching `features/procurement-officer/api/purchase-orders.ts`
  because that file was being edited by a parallel agent at the time (its `PurchaseOrderFilters`
  type doesn't declare `purchase_request_id`, so passing it through the shared hook would have
  been an excess-property TS error anyway).
- `requires_philgeps: boolean` exists on `PurchaseRequestResource` (server-computed:
  `total_amount >= 50000`) and is now on the `PurchaseRequest` type; `fund_source` never existed
  on any resource and was already gone from the codebase by the time this task ran (no action
  needed despite being listed in the original task brief — always re-grep before assuming a
  described bug still exists).
- `StorePurchaseOrderRequest` requires `prepared_by_id` (the acting user's own id, from
  `useAuthStore().user.id`) in addition to `purchase_request_id` — `useGeneratePurchaseOrder` in
  `ProcurementRequestDetail.tsx` was 422-ing without it.

**Why:** These were all silent contract mismatches (wrong field names, wrong paths, dropped
payload keys) that Laravel/TS never caught because either the field was simply ignored
server-side (extra JSON keys) or the UI degraded gracefully to an always-empty fallback
(`?? []`) instead of an error.
**How to apply:** Before touching any other still-unaudited entity in this codebase (see
[[procurement-chain-ui-patterns]] for the RFQ/Abstract/BacResolution/NOA/Supplier equivalents,
already fixed), assume the same class of bug is possible and cross-check the real Laravel
FormRequest + Resource in `../ppas-api` rather than trusting the existing frontend type as
ground truth.
