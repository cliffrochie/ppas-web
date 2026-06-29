---
name: global-entity-types
description: Location and structure of all centralized entity types in ppas-web, and the const+type alias pattern used for enum-like status fields
metadata:
  type: project
---

All database entity interfaces live in `src/types/entities/`, one file per domain group, with a barrel at `src/types/entities/index.ts`. Everything is re-exported from `src/types/index.ts` via `export * from './entities'`.

## File layout

| File | Entities |
|---|---|
| `role.ts` | `Role` |
| `office.ts` | `Office` |
| `user.ts` | `User`, `CreateUserPayload`, `UpdateUserPayload` |
| `category.ts` | `Category` |
| `purchase-request.ts` | `PurchaseRequest`, `PurchaseRequestItem`, `PrAttachment`, `PrStatusHistory` + `PurchaseRequestStatus`, `PrAttachmentType` enums + payload types |
| `purchase-order.ts` | `PurchaseOrder`, `PurchaseOrderItem` + `PurchaseOrderStatus` enum + payload types |
| `rfq.ts` | `Rfq`, `RfqItem`, `CanvassResponse` + `RfqStatus` enum + payload types |
| `procurement.ts` | `AbstractOfQuotation`, `BacResolution`, `NoticeOfAward` + `AbstractStatus` enum |
| `notification.ts` | `Notification` |
| `audit-log.ts` | `AuditLog`, `LoginLog` + `AuditEvent`, `LoginStatus` enums |

## Key conventions

- Decimal columns (`total_amount`, `unit_cost`, `quantity`, etc.) are typed as `string` — Laravel serializes MySQL decimals as strings in JSON responses
- Date-only columns (`delivery_date`, `issued_at`, etc.) are typed as `string` — ISO date: YYYY-MM-DD
- Relation fields are optional (`requester?: User`) because they're only present when eager-loaded
- Enum-like status fields use the `as const` object + companion type alias pattern, exported WITHOUT `type` in barrels so consumers get both value and type:
  ```ts
  // purchase-request.ts
  export const PurchaseRequestStatus = { Draft: 'draft', ... } as const;
  export type PurchaseRequestStatus = (typeof PurchaseRequestStatus)[keyof typeof PurchaseRequestStatus];
  // entities/index.ts — export { PurchaseRequestStatus } (no `type` keyword)
  ```
- `pr_status_histories` rows are immutable/append-only — never update, always insert

## requests feature re-exports

`features/requests/types/index.ts` re-exports `PurchaseRequest as Request` (type alias) and `PurchaseRequestStatus as RequestStatus` (value+type re-export). Components import from `../types` locally; the feature barrel (`index.ts`) exports `{ RequestStatus }` (without `type`) to preserve the const-object value.

## Schema source

`/home/mananap/Development/spec-vault/my-personal-projects/ppas/schema-design/schema-v1.md` — single file, not a directory.

**Why:** Centralizing entity types ensures all feature modules (requester, procurement_officer, budget_officer, supply_officer) consume the same canonical shapes rather than re-declaring divergent local types.

**How to apply:** When scaffolding any new feature module, import entity types from `@/types` rather than defining local interfaces that duplicate the DB schema.
