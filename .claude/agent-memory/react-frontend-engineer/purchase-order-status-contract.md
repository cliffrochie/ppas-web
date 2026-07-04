---
name: purchase-order-status-contract
description: Corrected (verified against Laravel source) PurchaseOrder status enum, endpoint, and payload shape — an earlier frontend implementation invented a different 7-value enum and a fictional /status sub-route
metadata:
  type: project
---

## Verified real contract (confirmed against `../ppas-api` PHP source, 2026-07-04)

- Status update endpoint is the standard `PATCH /purchase-orders/{id}` (the apiResource route).
  There is **no** `/purchase-orders/{id}/status` sub-route — do not reintroduce it.
- `UpdatePurchaseOrderRequest` fields: `prepared_by_id`, `supplier_name`, `supplier_address`,
  `delivery_terms`, `payment_terms`, `delivery_date`, `total_amount`, `status`, `signed_po_path`.
  **There is no `remarks` field on this endpoint** — don't add a payload field for it, even though
  the analogous PR status-update endpoint (`PATCH /requests/:id/status`) does accept `remarks`.
  If a remarks *input* is wanted in the UI for UX reasons, keep it local UI state, don't type it
  into the mutation payload.
- The real `PurchaseOrderStatus` enum (also used by `StorePurchaseOrderRequest`) is exactly 5
  values: `draft, for_signature, supplier_acceptance, delivery_inspection, completed`. There is
  **no** `signed`, `acknowledged`, `for_completion`, or `failed` status — an earlier frontend pass
  invented these as a 7-value enum with a "Fail" action; that was a fictional workflow, not a
  relabeling. Do not resurrect a "Fail"/terminal-failure button for POs — no such state exists in
  the real backend.
- `po.purchase_request?.fund_source` does not exist on `PurchaseRequestResource` — don't add UI
  that reads it (removed from `PurchaseOrderDetail.tsx`'s info-card grid).

## Where this lives in code

- Enum: `src/types/entities/purchase-order.ts` (`PurchaseOrderStatus` const + type).
- Mutation: `src/features/procurement-officer/api/purchase-orders.ts` (`useUpdatePoStatus`,
  `PoStatusPayload` — no `remarks` field).
- Status badge styles/labels: `PO_STATUS_STYLES` / `PO_STATUS_LABELS` in
  `PurchaseOrdersTable.tsx` (5-entry records, one per real status).
- Stepper + workflow-advance logic: `PO_STEP_COUNT` (0-4) and `PROCEED_MAP` in
  `PurchaseOrderDetail.tsx` — `draft(0)→for_signature(1)→supplier_acceptance(2)→
  delivery_inspection(3)→completed(4)`. The lone "Mark as complete" button special-case now
  triggers on `po.status === 'delivery_inspection'` (the real last-step-before-completion status),
  not the old fictional `for_completion`.

**Why:** A contract audit against the actual Laravel FormRequests/Controllers found the whole PO
status sub-system (endpoint path, enum, remarks field, fund_source field) had been built against
an imagined contract rather than the real one — see [[procurement-chain-ui-patterns]] for the
sibling pattern of verifying backend contracts via `../ppas-api` source rather than assumption.
**How to apply:** Any future work touching PO status (new UI, new transition button, notification
copy referencing PO status names) must use this 5-value vocabulary and the plain `PATCH
/purchase-orders/{id}` endpoint — never re-derive or guess the PO status enum from the analogous
PR status lifecycle, they are unrelated enums on unrelated endpoints.
