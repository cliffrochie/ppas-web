import type { Category } from './category';
import type { User } from './user';

export interface Supplier {
  id: number;
  name: string;
  tin_number: string | null;
  category_id: number | null;
  website: string | null;
  tags: string[];
  contact_person: string | null;
  email: string;
  phone: string | null;
  address_street: string | null;
  address_city: string | null;
  address_province: string | null;
  address_zip: string | null;
  // Decimal(5,2) columns — Laravel serializes as string, null when not yet recorded
  on_time_delivery_rate: string | null;
  defect_rate: string | null;
  is_active: boolean;
  logo_url: string | null;
  // Relations — only present when eager-loaded
  category?: Category;
  documents?: SupplierDocument[];
  created_at: string;
  updated_at: string;
}

export interface SupplierDocument {
  id: number;
  supplier_id: number;
  uploader_id: number;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  download_url: string;
  uploader?: User;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierPayload {
  name: string;
  tin_number?: string;
  category_id?: number;
  website?: string;
  tags?: string[];
  contact_person?: string;
  email: string;
  phone?: string;
  address_street?: string;
  address_city?: string;
  address_province?: string;
  address_zip?: string;
  is_active?: boolean;
}

export interface CreateSupplierDocumentPayload {
  supplier_id: number;
  file: File;
}
