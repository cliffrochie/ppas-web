import type { PurchaseRequest, CreatePurchaseRequestItemPayload } from '@/types';

/**
 * Feature-level alias for `PurchaseRequest`.
 * The list endpoint returns PurchaseRequest records with eager-loaded
 * `requester`, `category`, and `requesting_office` relations.
 */
export type Request = PurchaseRequest;

/**
 * Re-export `PurchaseRequestStatus` under the local alias `RequestStatus`.
 * This covers both the const object (value) and the union type — consumers
 * may use `RequestStatus.Draft` or `status: RequestStatus` interchangeably.
 */
export { PurchaseRequestStatus as RequestStatus } from '@/types';

export interface RequestFilters {
  search?: string;
  page?: number;
  per_page?: number;
  /** Column name to sort by (e.g. 'rf_number', 'submitted_at', 'total_amount', 'status') */
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface RequestSortState {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * API payload for creating a new purchase request.
 * Extends the shared payload with `end_user_name` (shown in the create form)
 * and the optional `is_draft` flag for the "Save Draft" action.
 */
export interface CreateRequestPayload {
  end_user_name: string;
  requesting_office_id: number;
  category_id?: number;
  purpose: string;
  items: CreatePurchaseRequestItemPayload[];
  is_draft?: boolean;
}
