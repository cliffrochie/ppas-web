import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/utils';
import type { AbstractOfQuotation, AbstractStatus } from '@/types';

// ─── Status badge ─────────────────────────────────────────────────────────────

const ABSTRACT_STATUS_STYLES: Record<AbstractStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  approved: 'bg-green-700 text-white',
};

export const AbstractStatusBadge = ({ status }: { status: AbstractStatus }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      ABSTRACT_STATUS_STYLES[status],
    )}
  >
    {status === 'approved' ? 'Approved' : 'Draft'}
  </span>
);

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatCurrency = (amount: string | null) =>
  amount === null
    ? '—'
    : Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

// ─── Table ────────────────────────────────────────────────────────────────────

interface AbstractsTableProps {
  data: AbstractOfQuotation[];
  isLoading: boolean;
}

const TABLE_COLUMNS = ['RFQ', 'Recommended Supplier', 'Recommended Amount', 'Status', 'Approved At'];
const SKELETON_ROWS = Array.from({ length: 8 });

export const AbstractsTable = ({ data, isLoading }: AbstractsTableProps) => {
  if (isLoading) {
    return (
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_COLUMNS.map((col) => (
                <TableHead key={col} className="font-semibold text-foreground">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {SKELETON_ROWS.map((_, i) => (
              <TableRow key={i}>
                {TABLE_COLUMNS.map((col) => (
                  <TableCell key={col}>
                    <div className="h-4 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_COLUMNS.map((col) => (
                <TableHead key={col} className="font-semibold text-foreground">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={TABLE_COLUMNS.length} className="py-12 text-center text-muted-foreground">
                No abstracts of quotation found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border sm:hidden">
        {data.map((abstract) => (
          <Link
            key={abstract.id}
            to={`/procurement-officer/abstracts/${abstract.id}`}
            className="block px-4 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-green-700">RFQ #{abstract.rfq_id}</span>
              <AbstractStatusBadge status={abstract.status} />
            </div>
            <p className="mt-1 text-sm text-gray-600">{abstract.recommended_supplier ?? '—'}</p>
          </Link>
        ))}
      </div>

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_COLUMNS.map((col) => (
                <TableHead key={col} className="font-semibold text-foreground">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((abstract) => (
              <TableRow key={abstract.id}>
                <TableCell>
                  <Link
                    to={`/procurement-officer/abstracts/${abstract.id}`}
                    className="font-medium text-green-700 hover:underline"
                  >
                    RFQ #{abstract.rfq_id}
                  </Link>
                </TableCell>
                <TableCell>{abstract.recommended_supplier ?? '—'}</TableCell>
                <TableCell>{formatCurrency(abstract.recommended_amount)}</TableCell>
                <TableCell>
                  <AbstractStatusBadge status={abstract.status} />
                </TableCell>
                <TableCell>{formatDate(abstract.approved_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
