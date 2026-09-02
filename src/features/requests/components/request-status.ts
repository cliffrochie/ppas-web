import type { PurchaseRequestStatus } from '@/types';

export type StatusConfig = { label: string; className: string };

export const STATUS_CONFIG: Record<PurchaseRequestStatus, StatusConfig> = {
  draft: { label: 'Draft', className: 'bg-gray-400 text-white' },
  submitted: { label: 'Submitted', className: 'bg-blue-500 text-white' },
  under_review: { label: 'Under Review', className: 'bg-purple-600 text-white' },
  returned: { label: 'Returned', className: 'bg-amber-500 text-white' },
  for_budget_approval: { label: 'For Budget Approval', className: 'bg-yellow-500 text-white' },
  disapproved: { label: 'Disapproved', className: 'bg-red-600 text-white' },
  budget_approved: { label: 'Budget Approved', className: 'bg-teal-600 text-white' },
  forwarded_to_ppu: { label: 'Forwarded to PPU', className: 'bg-blue-600 text-white' },
  pr_prepared: { label: 'PR Prepared', className: 'bg-blue-700 text-white' },
  pr_approved: { label: 'PR Approved', className: 'bg-green-600 text-white' },
  rfq_prepared: { label: 'RFQ Prepared', className: 'bg-indigo-500 text-white' },
  canvassing: { label: 'Canvassing', className: 'bg-orange-500 text-white' },
  abstract_prepared: { label: 'Abstract Prepared', className: 'bg-indigo-600 text-white' },
  bac_resolution_noa: { label: 'BAC Resolution / NOA', className: 'bg-violet-600 text-white' },
  po_prepared: { label: 'PO Prepared', className: 'bg-cyan-700 text-white' },
  completed: { label: 'Completed', className: 'bg-green-700 text-white' },
};

/** `{ value, label }` list for status filter dropdowns, in lifecycle order. */
export const REQUEST_STATUS_OPTIONS: { value: PurchaseRequestStatus; label: string }[] = (
  Object.keys(STATUS_CONFIG) as PurchaseRequestStatus[]
).map((value) => ({ value, label: STATUS_CONFIG[value].label }));
