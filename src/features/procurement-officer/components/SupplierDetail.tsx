import { Globe, MapPin, Phone, Building2, FileText, Download, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Supplier } from '@/types';
import { cn } from '@/utils';

// ─── Rate formatting ──────────────────────────────────────────────────────────
// `on_time_delivery_rate` / `defect_rate` are decimal(5,2) columns — Laravel
// serializes them as strings, and they're null until performance data exists.

const formatRate = (rate: string | null) => (rate === null ? null : Number(rate));

// ─── Progress bar row ─────────────────────────────────────────────────────────

const ProgressRow = ({ label, rate }: { label: string; rate: number | null }) => (
  <div className="mb-3">
    <div className="mb-1 flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-800">{rate === null ? '—' : `${rate}%`}</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-green-600"
        style={{ width: `${rate ?? 0}%` }}
        role="presentation"
      />
    </div>
  </div>
);

// ─── Compliance documents list ─────────────────────────────────────────────────

const DocumentsList = ({ documents }: { documents: NonNullable<Supplier['documents']> }) => (
  <ul className="divide-y divide-gray-50">
    {documents.map((doc) => (
      <li key={doc.id} className="flex items-center justify-between gap-2 py-3">
        <span className="truncate text-sm text-gray-700">{doc.file_name}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Download ${doc.file_name}`}
          render={<a href={doc.download_url} target="_blank" rel="noopener noreferrer" />}
        >
          <Download className="size-4" aria-hidden="true" />
        </Button>
      </li>
    ))}
  </ul>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface SupplierDetailProps {
  supplier: Supplier;
}

export const SupplierDetail = ({ supplier }: SupplierDetailProps) => {
  const address = [
    supplier.address_street,
    supplier.address_city,
    supplier.address_province,
    supplier.address_zip,
  ]
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
              {supplier.logo_url ? (
                <img
                  src={supplier.logo_url}
                  alt={`${supplier.name} logo`}
                  className="mt-1 size-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <Building2 className="mt-1 size-5 shrink-0 text-gray-500" aria-hidden="true" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-green-700">{supplier.name}</h1>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      supplier.is_active
                        ? 'bg-green-600 text-white'
                        : 'bg-rose-200 text-rose-700',
                    )}
                  >
                    {supplier.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{supplier.category?.name ?? '—'}</p>
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
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              render={<Link to={`/procurement-officer/suppliers/${supplier.id}/edit`} />}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-700">
            Performance
          </p>
          <ProgressRow label="On-time Delivery" rate={formatRate(supplier.on_time_delivery_rate)} />
          <ProgressRow label="Defect Rate" rate={formatRate(supplier.defect_rate)} />
        </div>

        {/* Compliance Documents */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 sm:px-6">
            <FileText className="size-4 text-gray-400" aria-hidden="true" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Compliance Documents
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            {!supplier.documents || supplier.documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents found.</p>
            ) : (
              <DocumentsList documents={supplier.documents} />
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
            {supplier.website ? (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="size-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                <a
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {supplier.website}
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
