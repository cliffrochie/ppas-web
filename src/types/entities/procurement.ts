import type { Rfq } from './rfq';
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
  /** Relative storage path to the uploaded abstract document */
  file_path: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations (present when eager-loaded by the API)
  rfq?: Rfq;
  prepared_by?: User;
  bac_resolution?: BacResolution;
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
  /** Relative storage path to the uploaded resolution document */
  file_path: string;
  /** ISO date string: YYYY-MM-DD */
  issued_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations (present when eager-loaded by the API)
  abstract_of_quotation?: AbstractOfQuotation;
  prepared_by?: User;
  notice_of_award?: NoticeOfAward;
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
  /** Relative storage path to the uploaded NOA document */
  file_path: string;
  /** ISO date string: YYYY-MM-DD */
  issued_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  bac_resolution?: BacResolution;
}
