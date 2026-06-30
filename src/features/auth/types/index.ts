import type { User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: User;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  /** ISO date string: YYYY-MM-DD */
  date_of_birth: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponseData {
  message: string;
}
