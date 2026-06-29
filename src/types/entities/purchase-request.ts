import type { Category } from './category';
import type { Office } from './office';
import type { User } from './user';

// ─── Status & attachment-type enums ────────────────────────────────────────

/**
 * All possible lifecycle statuses for a purchase request.
 * Use the object keys (e.g. PurchaseRequestStatus.Draft) in UI code;
 * the union type PurchaseRequestStatus guards API response values.
 */
export const PurchaseRequestStatus = {
  Draft: 'draft',
  Submitted: 'submitted',
  UnderReview: 'under_review',
  Returned: 'returned',
  ForBudgetApproval: 'for_budget_approval',
  Disapproved: 'disapproved',
  BudgetApproved: 'budget_approved',
  ForwardedToPpu: 'forwarded_to_ppu',
  PrPrepared: 'pr_prepared',
  PrApproved: 'pr_approved',
  RfqPrepared: 'rfq_prepared',
  Canvassing: 'canvassing',
  AbstractPrepared: 'abstract_prepared',
  BacResolutionNoa: 'bac_resolution_noa',
  PoPrepared: 'po_prepared',
  Completed: 'completed',
} as const;

export type PurchaseRequestStatus =
  (typeof PurchaseRequestStatus)[keyof typeof PurchaseRequestStatus];

export const PrAttachmentType = {
  AppPpmp: 'app_ppmp',
  SignedPr: 'signed_pr',
  Rfq: 'rfq',
  BacResolution: 'bac_resolution',
  Noa: 'noa',
  Other: 'other',
} as const;

export type PrAttachmentType =
  (typeof PrAttachmentType)[keyof typeof PrAttachmentType];

// ─── Core entities ──────────────────────────────────────────────────────────

export interface PurchaseRequest {
  id: number;
  /** Null until Requester submits (draft → submitted). Format: RF-YYYY-NNN */
  rf_number: string | null;
  /** Null until PPU prepares the formal PR document (forwarded_to_ppu → pr_prepared) */
  pr_number: string | null;
  requester_id: number;
  requesting_office_id: number;
  category_id: number | null;
  purpose: string;
  status: PurchaseRequestStatus;
  /** Encoded by Budget Officer on approval; also stored in pr_status_histories */
  alobs_number: string | null;
  /** Decimal stored as string to preserve precision */
  total_amount: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations (present when eager-loaded by the API)
  requester?: User;
  requesting_office?: Office;
  category?: Category;
  items?: PurchaseRequestItem[];
  attachments?: PrAttachment[];
  status_histories?: PrStatusHistory[];
}

export interface PurchaseRequestItem {
  id: number;
  purchase_request_id: number;
  item_description: string;
  specifications: string | null;
  unit_of_measure: string;
  /** Decimal stored as string */
  quantity: string;
  /** Decimal stored as string; maps to "Estimated Price" in the form */
  unit_cost: string;
  /** Decimal stored as string; computed: quantity × unit_cost */
  total_cost: string;
  created_at: string;
  updated_at: string;
}

export interface PrAttachment {
  id: number;
  purchase_request_id: number;
  uploader_id: number;
  type: PrAttachmentType;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  // Relations
  uploader?: User;
}

/** Immutable — one row per status transition; never updated. */
export interface PrStatusHistory {
  id: number;
  purchase_request_id: number;
  actor_id: number;
  /** Null on the very first submission (no prior status) */
  from_status: PurchaseRequestStatus | null;
  to_status: PurchaseRequestStatus;
  remarks: string | null;
  alobs_number: string | null;
  acted_at: string;
  created_at: string;
  // Relations
  actor?: User;
}

// ─── Payload types ──────────────────────────────────────────────────────────

export interface CreatePurchaseRequestItemPayload {
  item_description: string;
  specifications?: string;
  unit_of_measure: string;
  quantity: number;
  unit_cost: number;
}

export interface CreatePurchaseRequestPayload {
  requesting_office_id: number;
  category_id?: number;
  purpose: string;
  items: CreatePurchaseRequestItemPayload[];
}

export interface UpdatePurchaseRequestPayload {
  requesting_office_id?: number;
  category_id?: number | null;
  purpose?: string;
  items?: CreatePurchaseRequestItemPayload[];
}

/** Used by role actors (BAC Sec, Budget Officer, PPU) to advance or reverse a PR's status. */
export interface UpdatePrStatusPayload {
  status: PurchaseRequestStatus;
  remarks?: string;
  alobs_number?: string;
}
