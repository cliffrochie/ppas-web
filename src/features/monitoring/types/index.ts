import type { AuditEvent, LoginStatus } from '@/types';

export interface AuditLogFilters {
  user_id?: number;
  /** Laravel morph type, e.g. 'App\\Models\\PurchaseRequest' */
  auditable_type?: string;
  auditable_id?: number;
  event?: AuditEvent;
  field?: string;
  ip_address?: string;
  /** ISO date (YYYY-MM-DD) */
  date_from?: string;
  /** ISO date (YYYY-MM-DD); backend requires date_to >= date_from */
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface LoginLogFilters {
  user_id?: number;
  search?: string;
  status?: LoginStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}
