import type { User } from './user';

// ─── Event & status enums ───────────────────────────────────────────────────

export const AuditEvent = {
  Created: 'created',
  Updated: 'updated',
  Deleted: 'deleted',
} as const;

export type AuditEvent = (typeof AuditEvent)[keyof typeof AuditEvent];

export const LoginStatus = {
  Success: 'success',
  Failed: 'failed',
  LockedOut: 'locked_out',
} as const;

export type LoginStatus = (typeof LoginStatus)[keyof typeof LoginStatus];

// ─── Core entities ──────────────────────────────────────────────────────────

/**
 * Field-level change log. Polymorphic — any model can be audited.
 * Index on (auditable_type, auditable_id) for efficient per-record lookups.
 */
export interface AuditLog {
  id: number;
  /** Nullable when the change was made by a system process (no authenticated user) */
  user_id: number | null;
  /** Laravel morph type; e.g. 'App\\Models\\PurchaseRequest' */
  auditable_type: string;
  auditable_id: number;
  event: AuditEvent;
  /** The column name that changed */
  field: string;
  old_value: string | null;
  new_value: string | null;
  /** Supports IPv6 (up to 45 chars) */
  ip_address: string | null;
  created_at: string;
  // Relations (present when eager-loaded by the API)
  user?: User;
}

/**
 * Every authentication attempt — successful or failed.
 * Kept separate from AuditLog because auth events are queried by different patterns
 * (e.g. failed attempts by IP or email, lockout detection).
 */
export interface LoginLog {
  id: number;
  /** Nullable on failed attempts where the user cannot be resolved from the submitted email */
  user_id: number | null;
  /** The email submitted in the login attempt */
  email: string;
  status: LoginStatus;
  /** Supports IPv6 (up to 45 chars) */
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Relations
  user?: User;
}
