import type { PurchaseRequest } from './purchase-request';
import type { User } from './user';

export interface Notification {
  id: number;
  /** The user receiving this notification */
  user_id: number;
  /** Nullable; the PR that triggered this notification */
  purchase_request_id: number | null;
  /** e.g. 'pr_submitted', 'pr_returned', 'pr_approved', 'po_generated' */
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  // Relations (present when eager-loaded by the API)
  user?: User;
  purchase_request?: PurchaseRequest;
}
