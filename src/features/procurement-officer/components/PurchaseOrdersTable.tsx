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
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types';

// ─── Status badge ─────────────────────────────────────────────────────────────

const PO_STATUS_STYLES: Record<PurchaseOrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  for_signature: 'bg-amber-100 text-amber-700',
  supplier_acceptance: 'bg-blue-100 text-blue-700',
  delivery_inspection: 'bg-teal-100 text-teal-700',
  completed: 'bg-green-700 text-white',
};

const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: 'Draft',
  for_signature: 'For Signature',
  supplier_acceptance: 'Supplier Acceptance',
  delivery_inspection: 'Delivery & Inspection',
  completed: 'Completed',
};

export const PoStatusBadge = ({ status }: { status: PurchaseOrderStatus }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      PO_STATUS_STYLES[status],
    )}
  >
    {PO_STATUS_LABELS[status]}
  </span>
);

// ─── Table ────────────────────────────────────────────────────────────────────

export interface PurchaseOrderSortState {
  column: string;
  direction: 'asc' | 'desc';
}

interface PurchaseOrdersTableProps {
  data: PurchaseOrder[];
  isLoading: boolean;
  sortState: PurchaseOrderSortState;
  onSortChange: (column: string) => void;
}

const columnHelper = createColumnHelper<PurchaseOrder>();

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

const SORTABLE_COLUMNS = ['po_number', 'created_at', 'supplier_name', 'total_amount', 'status'];

const TABLE_COLUMNS = [
  { key: 'po_number', label: 'PO #' },
  { key: 'created_at', label: 'PO Date' },
  { key: 'supplier_name', label: 'Supplier' },
  { key: 'pr_number', label: 'Reference PR #' },
  { key: 'total_amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
];

const SKELETON_ROWS = Array.from({ length: 8 });

export const PurchaseOrdersTable = ({
  data,
  isLoading,
  sortState,
  onSortChange,
}: PurchaseOrdersTableProps) => {
  const navigate = useNavigate();

  const columns = [
    columnHelper.accessor('po_number', {
      header: 'PO #',
      cell: (info) => {
        const poNumber = info.getValue();
        const poId = info.row.original.id;
        return (
          <Link
            to={`/procurement-officer/purchase-orders/${poId}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-green-700 hover:underline"
          >
            {poNumber}
          </Link>
        );
      },
    }),
    columnHelper.accessor('created_at', {
      header: 'PO Date',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('supplier_name', {
      header: 'Supplier',
      cell: (info) => info.getValue() ?? '—',
    }),
    columnHelper.display({
      id: 'pr_number',
      header: 'Reference PR #',
      cell: ({ row }) => row.original.purchase_request?.pr_number ?? '—',
    }),
    columnHelper.accessor('total_amount', {
      header: 'Amount',
      cell: (info) => (
        <span className="tabular-nums">{formatAmount(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <PoStatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit PO ${row.original.po_number}`}
          className="text-muted-foreground hover:text-foreground"
          render={
            <Link
              to={`/procurement-officer/purchase-orders/${row.original.id}`}
              onClick={(e) => e.stopPropagation()}
            />
          }
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

  if (data.length === 0) {
    return (
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {TABLE_COLUMNS.map((col) => {
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
              })}
              <TableHead className="font-semibold text-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={TABLE_COLUMNS.length + 1}
                className="py-12 text-center text-muted-foreground"
              >
                No purchase orders found.
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
        {data.map((po) => (
          <Link
            key={po.id}
            to={`/procurement-officer/purchase-orders/${po.id}`}
            className="block px-4 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-green-700">{po.po_number}</span>
              <PoStatusBadge status={po.status} />
            </div>
            <p className="mt-1 text-sm text-gray-600">{po.supplier_name ?? '—'}</p>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{formatDate(po.created_at)}</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatAmount(po.total_amount)}
              </span>
            </div>
          </Link>
        ))}
      </div>

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
                onClick={() => navigate(`/procurement-officer/purchase-orders/${row.original.id}`)}
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
