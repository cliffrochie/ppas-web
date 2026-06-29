import type { Office } from './office';
import type { Role } from './role';

export interface User {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  extension_name: string | null;
  email: string;
  role_id: number;
  office_id: number | null;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations (present when eager-loaded by the API)
  role?: Role;
  office?: Office;
}

export interface CreateUserPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  office_id?: number;
}

export interface UpdateUserPayload {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  extension_name?: string;
  email?: string;
  role_id?: number;
  office_id?: number | null;
  is_active?: boolean;
}
