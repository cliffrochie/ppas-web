import type { User } from './user';

// ─── Status enum ────────────────────────────────────────────────────────────

export const AbstractStatus = {
  Draft: 'draft',
  Approved: 'approved',
} as const;

export type AbstractStatus = (typeof AbstractStatus)[keyof typeof AbstractStatus];

// ─── Core entities ──────────────────────────────────────────────────────────

/**
 * TWG/BAC-prepared abstract comparing canvass responses across suppliers.
 * One per RFQ (1:1 relation).
 */
export interface AbstractOfQuotation {
  id: number;
  rfq_id: number;
  prepared_by_id: number;
  recommended_supplier: string | null;
  /** Decimal stored as string */
  recommended_amount: string | null;
  status: AbstractStatus;
  // file_path is write-only — never returned by the API.
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations (present when eager-loaded by the API)
  prepared_by?: User;
}

/**
 * BAC Resolution prepared from the approved Abstract of Quotation.
 * One per abstract (1:1 relation).
 */
export interface BacResolution {
  id: number;
  resolution_number: string;
  abstract_of_quotation_id: number;
  prepared_by_id: number;
  // file_path is write-only — never returned by the API.
  /** ISO date string: YYYY-MM-DD */
  issued_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations (present when eager-loaded by the API)
  prepared_by?: User;
}

/**
 * Notice of Award issued from the BAC Resolution.
 * One per resolution (1:1 relation).
 */
export interface NoticeOfAward {
  id: number;
  noa_number: string;
  bac_resolution_id: number;
  awarded_supplier: string;
  /** Decimal stored as string */
  awarded_amount: string;
  // file_path is write-only — never returned by the API.
  /** ISO date string: YYYY-MM-DD */
  issued_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Payload types ──────────────────────────────────────────────────────────

export interface CreateAbstractOfQuotationPayload {
  rfq_id: number;
  prepared_by_id: number;
  recommended_supplier?: string;
  recommended_amount?: number;
  status?: AbstractStatus;
  /** Storage path of an already-uploaded pr_attachment */
  file_path?: string;
  approved_at?: string;
}

export interface UpdateAbstractOfQuotationPayload {
  prepared_by_id?: number;
  recommended_supplier?: string | null;
  recommended_amount?: number | null;
  status?: AbstractStatus;
  file_path?: string;
  approved_at?: string | null;
}

export interface CreateBacResolutionPayload {
  resolution_number: string;
  abstract_of_quotation_id: number;
  prepared_by_id: number;
  /** Storage path of an already-uploaded pr_attachment; required by the API */
  file_path: string;
  issued_at?: string;
}

export interface UpdateBacResolutionPayload {
  resolution_number?: string;
  prepared_by_id?: number;
  file_path?: string;
  issued_at?: string | null;
}

export interface CreateNoticeOfAwardPayload {
  noa_number: string;
  bac_resolution_id: number;
  awarded_supplier: string;
  awarded_amount: number;
  /** Storage path of an already-uploaded pr_attachment; required by the API */
  file_path: string;
  issued_at?: string;
}

export interface UpdateNoticeOfAwardPayload {
  noa_number?: string;
  awarded_supplier?: string;
  awarded_amount?: number;
  file_path?: string;
  issued_at?: string | null;
}
