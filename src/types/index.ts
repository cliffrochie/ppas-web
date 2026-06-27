export interface ApiResponse<T> {
  data: T;
  message: string;
  errors: null;
}

export interface ApiMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: ApiMeta;
  message: string;
  errors: null;
}

export interface ApiError {
  data: null;
  message: string;
  errors: Record<string, string[]> | null;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface SelectOption<T = number | string> {
  label: string;
  value: T;
}

export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type EntityId = number;
export type ISODateString = string;

export const isApiValidationError = (
  error: unknown,
): error is ApiError & { errors: Record<string, string[]> } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    !!(error as ApiError).errors
  );
};
