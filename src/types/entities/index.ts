// ─── Reference data ─────────────────────────────────────────────────────────
export type { Role } from './role';
export type { Office } from './office';
export type { User, CreateUserPayload, UpdateUserPayload } from './user';
export type { Category } from './category';

// ─── Purchase requests ───────────────────────────────────────────────────────
// Const objects that also have a type alias of the same name are exported
// without `type` so consumers can use both the value and the type.
export { PurchaseRequestStatus, PrAttachmentType } from './purchase-request';
export type {
  PurchaseRequest,
  PurchaseRequestItem,
  PrAttachment,
  PrStatusHistory,
  CreatePurchaseRequestItemPayload,
  CreatePurchaseRequestPayload,
  UpdatePurchaseRequestPayload,
  UpdatePrStatusPayload,
} from './purchase-request';

// ─── Purchase orders ─────────────────────────────────────────────────────────
export { PurchaseOrderStatus } from './purchase-order';
export type {
  PurchaseOrder,
  PurchaseOrderItem,
  CreatePurchaseOrderItemPayload,
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderPayload,
} from './purchase-order';

// ─── RFQs & canvassing ───────────────────────────────────────────────────────
export { RfqStatus } from './rfq';
export type {
  Rfq,
  RfqItem,
  CanvassResponse,
  CreateRfqItemPayload,
  CreateRfqPayload,
  CreateCanvassResponsePayload,
} from './rfq';

// ─── Procurement documents ───────────────────────────────────────────────────
export { AbstractStatus } from './procurement';
export type {
  AbstractOfQuotation,
  BacResolution,
  NoticeOfAward,
} from './procurement';

// ─── Notifications ───────────────────────────────────────────────────────────
export type { Notification } from './notification';

// ─── Audit & login logs ──────────────────────────────────────────────────────
export { AuditEvent, LoginStatus } from './audit-log';
export type {
  AuditLog,
  LoginLog,
} from './audit-log';
