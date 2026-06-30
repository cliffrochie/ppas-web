import { Globe, MapPin, Phone, Building2, FileText, Eye, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import type { Supplier, SupplierPurchaseOrder } from '@/types';

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

// ─── PO status badge (generic string) ────────────────────────────────────────

const PoStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-700 text-white',
    failed: 'bg-red-100 text-red-700',
    acknowledged: 'bg-violet-100 text-violet-700',
    for_completion: 'bg-teal-100 text-teal-700',
    signed: 'bg-blue-100 text-blue-700',
    for_signature: 'bg-amber-100 text-amber-700',
    draft: 'bg-gray-100 text-gray-600',
  };
  const label: Record<string, string> = {
    completed: 'Completed',
    failed: 'Failed',
    acknowledged: 'Approved',
    for_completion: 'For Completion',
    signed: 'Pending',
    for_signature: 'Pending',
    draft: 'Draft',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles[status] ?? 'bg-gray-100 text-gray-600',
      )}
    >
      {label[status] ?? status}
    </span>
  );
};

// ─── Progress bar row ─────────────────────────────────────────────────────────

const ProgressRow = ({ label, rate }: { label: string; rate: number }) => (
  <div className="mb-3">
    <div className="mb-1 flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-800">{rate}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-green-600"
        style={{ width: `${rate}%` }}
        role="presentation"
      />
    </div>
  </div>
);

// ─── Recent PO table ──────────────────────────────────────────────────────────

const RecentPoTable = ({ rows }: { rows: SupplierPurchaseOrder[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {['PO #', 'Date', 'Amount', 'Status', 'View'].map((h) => (
            <th
              key={h}
              className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-gray-50">
            <td className="py-3">
              <Link
                to={`/procurement-officer/purchase-orders/${row.id}`}
                className="font-medium text-green-700 hover:underline"
              >
                {row.po_number}
              </Link>
            </td>
            <td className="py-3 text-gray-600">{formatDate(row.date)}</td>
            <td className="py-3 tabular-nums text-gray-600">{formatCurrency(row.amount)}</td>
            <td className="py-3">
              <PoStatusBadge status={row.status} />
            </td>
            <td className="py-3">
              <Button variant="ghost" size="icon-sm" aria-label={`View ${row.po_number}`} asChild>
                <Link to={`/procurement-officer/purchase-orders/${row.id}`}>
                  <Eye className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface SupplierDetailProps {
  supplier: Supplier;
}

export const SupplierDetail = ({ supplier }: SupplierDetailProps) => {
  const address = [supplier.street_address, supplier.city, supplier.state, supplier.zip]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      {/* ─── Main column ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6">
        {/* Header card */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="mt-1 size-5 shrink-0 text-gray-500" aria-hidden="true" />
              <div>
                <h1 className="text-2xl font-semibold text-green-700">{supplier.name}</h1>
                <p className="text-sm text-gray-500">{supplier.category}</p>
                {supplier.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {supplier.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link to={`/procurement-officer/suppliers/${supplier.id}/edit`}>Edit Profile</Link>
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-gray-900">{supplier.total_orders}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total Orders
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Total Value: {formatCurrency(supplier.total_value)}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-gray-900">{formatDate(supplier.last_order_date)}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Last Order</p>
            <p className="mt-1 text-xs text-gray-500">{supplier.last_order_po ?? '—'}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(supplier.highest_order_value)}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Highest Order
            </p>
            <p className="mt-1 text-xs text-gray-500">{supplier.highest_order_po ?? '—'}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-700">
              Performance
            </p>
            <ProgressRow label="On-time Delivery" rate={supplier.on_time_delivery_rate} />
            <ProgressRow label="Quality (Defect Rate)" rate={supplier.quality_rate} />
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 sm:px-6">
            <FileText className="size-4 text-gray-400" aria-hidden="true" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Recent Purchase Orders
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            {supplier.recent_purchase_orders.length === 0 ? (
              <p className="text-sm text-gray-400">No purchase orders found.</p>
            ) : (
              <RecentPoTable rows={supplier.recent_purchase_orders} />
            )}
          </div>
        </div>
      </div>

      {/* ─── Right column ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
        {/* Contact Details */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Contact Details
            </h2>
          </div>
          <div className="space-y-3 p-4 sm:p-6">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
              <span>{address || '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
              <span>{supplier.phone ?? '—'}</span>
            </div>
            {supplier.website_url ? (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                <a
                  href={supplier.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {supplier.website_url}
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                <span>—</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary Contact */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Primary Contact
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100"
                aria-hidden="true"
              >
                <User className="size-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-700">
                  {supplier.contact_person ?? '—'}
                </p>
                <p className="text-xs text-gray-500">Primary Contact</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
