import type { Category, PurchaseRequest, PurchaseRequestStatus } from '@/types';

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
  status?: PurchaseRequestStatus;
  category_id?: Category['id'];
  page?: number;
  per_page?: number;
  /** Column name to sort by (e.g. 'rf_number', 'submitted_at', 'total_amount', 'status') */
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface RequestSortState {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * API payload for `POST /purchase-requests`. Line items are NOT included here —
 * the backend has no inline `items` field; each item is created afterwards via
 * a separate `POST /purchase-request-items` call once the PR's id is known.
 */
export interface CreateRequestPayload {
  requester_id: number;
  requesting_office_id: number;
  category_id?: number;
  purpose: string;
  status: PurchaseRequestStatus;
}
