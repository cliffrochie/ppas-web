import type { PurchaseOrderStatus } from '@/types';

export const PO_STATUS_STYLES: Record<PurchaseOrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  for_signature: 'bg-amber-100 text-amber-700',
  supplier_acceptance: 'bg-blue-100 text-blue-700',
  delivery_inspection: 'bg-teal-100 text-teal-700',
  completed: 'bg-green-700 text-white',
};

export const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: 'Draft',
  for_signature: 'For Signature',
  supplier_acceptance: 'Supplier Acceptance',
  delivery_inspection: 'Delivery & Inspection',
  completed: 'Completed',
};

/** `{ value, label }` list for the status filter dropdown. */
export const PO_STATUS_OPTIONS: { value: PurchaseOrderStatus; label: string }[] = (
  Object.keys(PO_STATUS_LABELS) as PurchaseOrderStatus[]
).map((value) => ({ value, label: PO_STATUS_LABELS[value] }));
