import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Pencil } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/utils';
import { RequestStatusBadge } from './RequestStatusBadge';
import type { Request, RequestSortState } from '../types';

interface RequestsTableProps {
  data: Request[];
  isLoading: boolean;
  sortState: RequestSortState;
  onSortChange: (column: string) => void;
}

const columnHelper = createColumnHelper<Request>();

/** Amount is returned as a decimal string (e.g. "15000.00") from the API. */
const formatAmount = (amount: string) =>
  new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

/**
 * Sort column names must match what the backend API accepts for `sort_by`.
 * Relation-based columns use snake_case keys the backend can resolve.
 */
const SORTABLE_COLUMNS = ['rf_number', 'requester_name', 'category_name', 'submitted_at', 'total_amount', 'status'];

const TABLE_COLUMNS = [
  { key: 'rf_number', label: 'RF #' },
  { key: 'requester_name', label: 'End-User' },
  { key: 'category_name', label: 'Category' },
  { key: 'submitted_at', label: 'Date Submitted' },
  { key: 'total_amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
];

const SKELETON_ROWS = Array.from({ length: 8 });

const SortableHeader = ({
  col,
  sortState,
  onSortChange,
}: {
  col: (typeof TABLE_COLUMNS)[number];
  sortState: RequestSortState;
  onSortChange: (column: string) => void;
}) => {
  const isSortable = SORTABLE_COLUMNS.includes(col.key);
  return (
    <TableHead key={col.key}>
      <button
        type="button"
        onClick={() => isSortable && onSortChange(col.key)}
        className={cn(
          'flex items-center gap-1.5 font-semibold text-foreground',
          isSortable && 'cursor-pointer hover:text-primary',
        )}
      >
        {col.label}
        {isSortable && (
          <ArrowUpDown
            className={cn(
              'size-3.5',
              sortState.column === col.key ? 'text-primary' : 'text-muted-foreground',
            )}
            aria-hidden="true"
          />
        )}
      </button>
    </TableHead>
  );
};

export const RequestsTable = ({
  data,
  isLoading,
  sortState,
  onSortChange,
}: RequestsTableProps) => {
  const navigate = useNavigate();

  const columns = [
    columnHelper.accessor('rf_number', {
      header: 'RF #',
      cell: (info) => {
        const rfNumber = info.getValue();
        const requestId = info.row.original.id;
        return (
          <Link
            to={`/requests/${requestId}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-green-700 hover:underline"
          >
            {rfNumber ?? `#${requestId}`}
          </Link>
        );
      },
    }),
    columnHelper.display({
      id: 'requester_name',
      header: 'End-User',
      cell: ({ row }) => {
        const r = row.original.requester;
        if (!r) return '—';
        const ext = r.extension_name ? ` ${r.extension_name}` : '';
        return `${r.first_name} ${r.last_name}${ext}`;
      },
    }),
    columnHelper.display({
      id: 'category_name',
      header: 'Category',
      cell: ({ row }) => row.original.category?.name ?? '—',
    }),
    columnHelper.accessor('submitted_at', {
      header: 'Date Submitted',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('total_amount', {
      header: 'Amount',
      cell: (info) => formatAmount(info.getValue()),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <RequestStatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: () => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Edit request"
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <>
        {/* Mobile skeleton cards */}
        <div className="divide-y divide-border sm:hidden">
          {SKELETON_ROWS.map((_, i) => (
            <div key={i} className="space-y-2 px-4 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="flex items-center justify-between gap-2">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop skeleton table */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                {TABLE_COLUMNS.map((col) => (
                  <TableHead key={col.key} className="font-semibold text-foreground">
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <ArrowUpDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    </div>
                  </TableHead>
                ))}
                <TableHead className="font-semibold text-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SKELETON_ROWS.map((_, i) => (
                <TableRow key={i}>
                  {TABLE_COLUMNS.map((col) => (
                    <TableCell key={col.key}>
                      <div className="h-4 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────

  if (data.length === 0) {
    return (
      <>
        {/* Mobile empty */}
        <p className="py-12 text-center text-sm text-muted-foreground sm:hidden">
          No requests found.
        </p>

        {/* Desktop empty table (keeps sortable header visible) */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                {TABLE_COLUMNS.map((col) => (
                  <SortableHeader
                    key={col.key}
                    col={col}
                    sortState={sortState}
                    onSortChange={onSortChange}
                  />
                ))}
                <TableHead className="font-semibold text-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={TABLE_COLUMNS.length + 1}
                  className="py-12 text-center text-muted-foreground"
                >
                  No requests found.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </>
    );
  }

  // ── Data ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mobile: card list — entire card is a link to the detail page */}
      <div className="divide-y divide-border sm:hidden">
        {data.map((request) => {
          const r = request.requester;
          const endUser = r
            ? `${r.first_name} ${r.last_name}${r.extension_name ? ` ${r.extension_name}` : ''}`
            : '—';

          return (
            <Link
              key={request.id}
              to={`/requests/${request.id}`}
              className="block px-4 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-green-700">
                  {request.rf_number ?? `#${request.id}`}
                </span>
                <RequestStatusBadge status={request.status} />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {endUser}
                {request.category?.name && (
                  <span className="text-gray-400"> · {request.category.name}</span>
                )}
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatDate(request.submitted_at)}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  ₱{formatAmount(request.total_amount)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop: full table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getFlatHeaders().map((header) => {
                const colKey = header.column.id;
                const isSortable = SORTABLE_COLUMNS.includes(colKey);
                const isActive = sortState.column === colKey;

                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : isSortable ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(colKey)}
                        className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown
                          className={cn(
                            'size-3.5',
                            isActive ? 'text-primary' : 'text-muted-foreground',
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      <span className="font-semibold text-foreground">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => navigate(`/requests/${row.original.id}`)}
                className="cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
