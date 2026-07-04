import { useState } from 'react';
import { Building2, Check, Globe, MapPin, Phone, Printer, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types';
import { PoStatusBadge } from './PurchaseOrdersTable';
import { useUpdatePoStatus } from '../api/purchase-orders';

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatCurrency = (amount: string | number) =>
  Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

// ─── Stepper ──────────────────────────────────────────────────────────────────

const PO_STEPS = [
  'Draft',
  'For signature',
  'Supplier Acceptance',
  'Delivery & Inspection',
  'Completed',
];

const PO_STEP_COUNT: Record<PurchaseOrderStatus, number> = {
  draft: 0,
  for_signature: 1,
  supplier_acceptance: 2,
  delivery_inspection: 3,
  completed: 4,
};

const HorizontalStepper = ({ status }: { status: PurchaseOrderStatus }) => {
  const completedCount = PO_STEP_COUNT[status];

  return (
    <ol className="mt-4 flex items-center gap-0">
      {PO_STEPS.map((step, index) => {
        const isDone = index < completedCount;
        const isActive = index === completedCount && completedCount < 4;
        const isLast = index === PO_STEPS.length - 1;

        return (
          <li key={step} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {index > 0 && (
                <div
                  className={cn('h-0.5 flex-1', index <= completedCount ? 'bg-green-500' : 'bg-white/20')}
                  aria-hidden="true"
                />
              )}
              {isDone ? (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-500">
                  <Check className="size-3.5 text-white" aria-hidden="true" />
                </div>
              ) : isActive ? (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-400">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>
              ) : (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-white/30">
                  <span className="text-xs font-medium text-white/40">{index + 1}</span>
                </div>
              )}
              {!isLast && (
                <div
                  className={cn('h-0.5 flex-1', index < completedCount ? 'bg-green-500' : 'bg-white/20')}
                  aria-hidden="true"
                />
              )}
            </div>
            <p
              className={cn(
                'mt-1.5 text-center text-xs',
                isDone ? 'text-green-300' : isActive ? 'text-amber-300' : 'text-white/60',
              )}
            >
              {step}
            </p>
          </li>
        );
      })}
    </ol>
  );
};

// ─── Header buttons ───────────────────────────────────────────────────────────

const PROCEED_MAP: Partial<Record<PurchaseOrderStatus, PurchaseOrderStatus>> = {
  draft: 'for_signature',
  for_signature: 'supplier_acceptance',
  supplier_acceptance: 'delivery_inspection',
  delivery_inspection: 'completed',
};

interface HeaderButtonsProps {
  po: PurchaseOrder;
}

const HeaderButtons = ({ po }: HeaderButtonsProps) => {
  const { mutate, isPending } = useUpdatePoStatus(po.id);
  const nextStatus = PROCEED_MAP[po.status];

  if (po.status === 'completed') return null;

  if (po.status === 'delivery_inspection') {
    return (
      <Button
        className="bg-green-500 text-white hover:bg-green-600"
        disabled={isPending}
        onClick={() => mutate({ status: 'completed' })}
      >
        <Check className="mr-1.5 size-4" aria-hidden="true" />
        {isPending ? 'Saving…' : 'Mark as complete'}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        className="bg-blue-500 text-white hover:bg-blue-600"
        onClick={() => window.print()}
      >
        <Printer className="mr-1.5 size-4" aria-hidden="true" />
        Print
      </Button>
      {nextStatus && (
        <Button
          className="bg-green-500 text-white hover:bg-green-600"
          disabled={isPending}
          onClick={() => mutate({ status: nextStatus })}
        >
          <Check className="mr-1.5 size-4" aria-hidden="true" />
          {isPending ? 'Saving…' : 'Proceed to next'}
        </Button>
      )}
    </div>
  );
};

// ─── Summary info card ────────────────────────────────────────────────────────

const InfoCard = ({
  label,
  value,
  icon: Icon,
  valueClass,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  valueClass?: string;
}) => (
  <div className="flex flex-col gap-1 border-r border-gray-100 px-4 py-3 last:border-r-0">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
    <div className="flex items-center gap-1.5">
      {Icon && <Icon className="size-4 text-gray-400 shrink-0" aria-hidden="true" />}
      <p className={cn('text-sm font-semibold text-gray-900', valueClass)}>{value}</p>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface PurchaseOrderDetailProps {
  po: PurchaseOrder;
}

export const PurchaseOrderDetail = ({ po }: PurchaseOrderDetailProps) => {
  const [uploadedFiles] = useState<File[]>([]);
  const items = po.items ?? [];
  const totalQty = items.reduce((sum, item) => sum + parseFloat(item.quantity), 0);

  return (
    <div className="min-h-full">
      {/* Dark green header band */}
      <div className="rounded-t-xl bg-green-800 px-6 py-5 text-white">
        {/* Row 1: PO # + badge | buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">{po.po_number}</h1>
            <PoStatusBadge status={po.status} />
          </div>
          <HeaderButtons po={po} />
        </div>

        {/* Row 2: metadata */}
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-green-200">
          <span>Created: {formatDate(po.created_at)}</span>
          {po.purchase_request && (
            <span>PR Ref: {po.purchase_request.pr_number ?? '—'}</span>
          )}
        </div>

        {/* Row 3: Stepper */}
        <HorizontalStepper status={po.status} />
      </div>

      {/* Summary info cards */}
      <div className="grid grid-cols-1 gap-0 border-b border-gray-100 bg-white sm:grid-cols-3">
        <InfoCard
          label="Supplier"
          value={po.supplier_name ?? '—'}
          icon={Building2}
        />
        <InfoCard
          label="Total Amount"
          value={formatCurrency(po.total_amount)}
          valueClass="text-green-700"
        />
        <InfoCard
          label="PR Reference"
          value={po.purchase_request?.pr_number ?? '—'}
        />
      </div>

      {/* Main two-column content */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Line Items */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Line Items
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              {items.length === 0 ? (
                <p className="text-sm text-gray-400">No items found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Item Description
                        </th>
                        <th className="pb-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Amount
                        </th>
                        <th className="pb-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Qty
                        </th>
                        <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 pr-4 text-gray-900">{item.item_description}</td>
                          <td className="py-3 pr-4 text-right tabular-nums text-gray-700">
                            {formatCurrency(item.unit_cost)}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-gray-700">
                            {parseFloat(item.quantity).toLocaleString()}
                          </td>
                          <td className="py-3 text-right tabular-nums font-medium text-gray-900">
                            {formatCurrency(item.total_cost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300">
                        <td className="pt-3 font-semibold text-gray-900">Total</td>
                        <td />
                        <td className="pt-3 pr-4 text-right tabular-nums font-semibold text-gray-900">
                          {totalQty.toLocaleString()}
                        </td>
                        <td className="pt-3 text-right tabular-nums font-bold text-gray-900">
                          {formatCurrency(po.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Attachments
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <p className="mb-3 text-xs text-gray-500">
                Upload approved relevant documents here:
              </p>
              <label
                htmlFor="po-file-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-green-300 px-6 py-8 hover:border-green-400 hover:bg-green-50/50"
              >
                <Upload className="size-6 text-green-600" aria-hidden="true" />
                <span className="text-sm text-green-700">Click or drag files to upload</span>
                <input id="po-file-upload" type="file" className="sr-only" multiple />
              </label>

              {uploadedFiles.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
                    >
                      <span className="flex-1 truncate text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-400">
                        {Math.round(file.size / 1024)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Supplier Details */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 sm:px-6">
              <Building2 className="size-4 text-gray-400" aria-hidden="true" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Supplier Details
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Category
                </p>
                <p className="mt-1 text-sm font-semibold text-green-700">—</p>
              </div>

              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Contact Details
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                    <span>{po.supplier_address ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                    <span>—</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                    <span className="text-green-600">—</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Primary Contact
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100"
                    aria-hidden="true"
                  >
                    <span className="text-xs font-medium text-gray-500">—</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-700">{po.supplier_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">Primary Contact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Logistics
              </h2>
            </div>
            <div className="space-y-3 p-4 sm:p-6">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Place of Delivery
                </p>
                <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  {po.supplier_address ?? '—'}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Date of Delivery
                </p>
                <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  {formatDate(po.delivery_date)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Delivery Term
                  </p>
                  <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                    {po.delivery_terms ?? '—'}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Payment Term
                  </p>
                  <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                    {po.payment_terms ?? '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

