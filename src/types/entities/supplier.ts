export interface Supplier {
  id: number;
  name: string;
  tin: string | null;
  category: string;
  website_url: string | null;
  tags: string[];
  status: 'active' | 'inactive';
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  contact_person: string | null;
  email: string;
  phone: string | null;
  on_time_delivery_rate: number;
  quality_rate: number;
  total_orders: number;
  total_value: string;
  last_order_date: string | null;
  last_order_po: string | null;
  highest_order_value: string;
  highest_order_po: string | null;
  recent_purchase_orders: SupplierPurchaseOrder[];
  created_at: string;
  updated_at: string;
}

export interface SupplierPurchaseOrder {
  id: number;
  po_number: string;
  date: string;
  amount: string;
  status: string;
}

export interface CreateSupplierPayload {
  name: string;
  tin?: string;
  category: string;
  website_url?: string;
  tags?: string[];
  status: 'active' | 'inactive';
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contact_person?: string;
  email: string;
  phone?: string;
}
