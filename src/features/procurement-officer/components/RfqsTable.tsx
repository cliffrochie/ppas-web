import { Link, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/utils';
import type { Rfq, RfqStatus } from '@/types';

// ─── Status badge ─────────────────────────────────────────────────────────────

const RFQ_STATUS_STYLES: Record<RfqStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  for_signature: 'bg-amber-100 text-amber-700',
  signed: 'bg-blue-100 text-blue-700',
  canvassing: 'bg-orange-100 text-orange-700',
  closed: 'bg-green-700 text-white',
};

const RFQ_STATUS_LABELS: Record<RfqStatus, string> = {
  draft: 'Draft',
  for_signature: 'For Signature',
  signed: 'Signed',
  canvassing: 'Canvassing',
  closed: 'Closed',
};

export const RfqStatusBadge = ({ status }: { status: RfqStatus }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      RFQ_STATUS_STYLES[status],
    )}
  >
    {RFQ_STATUS_LABELS[status]}
  </span>
);

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

// ─── Table ────────────────────────────────────────────────────────────────────

interface RfqsTableProps {
  data: Rfq[];
  isLoading: boolean;
}

const TABLE_COLUMNS = ['RFQ #', 'Purchase Request', 'Deadline', 'Prepared By', 'Status'];
const SKELETON_ROWS = Array.from({ length: 8 });

export const RfqsTable = ({ data, isLoading }: RfqsTableProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <>
        <div className="divide-y divide-border sm:hidden">
          {SKELETON_ROWS.map((_, i) => (
            <div key={i} className="space-y-2 px-4 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            </div>
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
      </>
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
                No RFQs found.
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
        {data.map((rfq) => (
          <Link
            key={rfq.id}
            to={`/procurement-officer/rfqs/${rfq.id}`}
            className="block px-4 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-green-700">{rfq.rfq_number}</span>
              <RfqStatusBadge status={rfq.status} />
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Deadline: {formatDate(rfq.deadline)}</span>
            </div>
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
            {data.map((rfq) => (
              <TableRow
                key={rfq.id}
                onClick={() => navigate(`/procurement-officer/rfqs/${rfq.id}`)}
                className="cursor-pointer"
              >
                <TableCell>
                  <Link
                    to={`/procurement-officer/rfqs/${rfq.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-green-700 hover:underline"
                  >
                    {rfq.rfq_number}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/procurement-officer/requests/${rfq.purchase_request_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-600 hover:underline"
                  >
                    #{rfq.purchase_request_id}
                  </Link>
                </TableCell>
                <TableCell>{formatDate(rfq.deadline)}</TableCell>
                <TableCell>
                  {rfq.prepared_by
                    ? [rfq.prepared_by.first_name, rfq.prepared_by.last_name].filter(Boolean).join(' ')
                    : '—'}
                </TableCell>
                <TableCell>
                  <RfqStatusBadge status={rfq.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
