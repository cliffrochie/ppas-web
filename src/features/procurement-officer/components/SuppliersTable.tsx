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
import type { Supplier } from '@/types';
import { cn } from '@/utils';

// ─── Status badge ─────────────────────────────────────────────────────────────

const SupplierStatusBadge = ({ isActive }: { isActive: Supplier['is_active'] }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium',
      isActive
        ? 'bg-green-600 text-white'
        : 'bg-rose-200 text-rose-700',
    )}
  >
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

// ─── Table ────────────────────────────────────────────────────────────────────

export interface SupplierSortState {
  column: string;
  direction: 'asc' | 'desc';
}

interface SuppliersTableProps {
  data: Supplier[];
  isLoading: boolean;
  sortState: SupplierSortState;
  onSortChange: (column: string) => void;
}

const columnHelper = createColumnHelper<Supplier>();

const SORTABLE_COLUMNS = ['name', 'address_city', 'contact_person', 'phone', 'is_active'];

const TABLE_COLUMNS = [
  { key: 'name', label: 'Supplier Name' },
  { key: 'address_city', label: 'Address' },
  { key: 'category', label: 'Category' },
  { key: 'contact_person', label: 'Contact Person' },
  { key: 'phone', label: 'Contact No.' },
  { key: 'is_active', label: 'Status' },
];

const SKELETON_ROWS = Array.from({ length: 8 });

export const SuppliersTable = ({
  data,
  isLoading,
  sortState,
  onSortChange,
}: SuppliersTableProps) => {
  const navigate = useNavigate();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Supplier Name',
      cell: (info) => (
        <Link
          to={`/procurement-officer/suppliers/${info.row.original.id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-medium text-green-700 hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.display({
      id: 'address_city',
      header: 'Address',
      cell: ({ row }) => {
        const parts = [row.original.address_city, row.original.address_province].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : '—';
      },
    }),
    columnHelper.display({
      id: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.category?.name ?? '—',
    }),
    columnHelper.accessor('contact_person', {
      header: 'Contact Person',
      cell: (info) => info.getValue() ?? '—',
    }),
    columnHelper.accessor('phone', {
      header: 'Contact No.',
      cell: (info) => info.getValue() ?? '—',
    }),
    columnHelper.accessor('is_active', {
      header: 'Status',
      cell: (info) => <SupplierStatusBadge isActive={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${row.original.name}`}
          className="text-muted-foreground hover:text-foreground"
          render={
            <Link
              to={`/procurement-officer/suppliers/${row.original.id}`}
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
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
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
                No suppliers found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="divide-y divide-border sm:hidden">
        {data.map((supplier) => (
          <Link
            key={supplier.id}
            to={`/procurement-officer/suppliers/${supplier.id}`}
            className="block px-4 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-green-700">{supplier.name}</span>
              <SupplierStatusBadge isActive={supplier.is_active} />
            </div>
            <p className="mt-1 text-sm text-gray-600">{supplier.category?.name ?? '—'}</p>
            <div className="mt-1 text-xs text-gray-500">
              {[supplier.address_city, supplier.address_province].filter(Boolean).join(', ') || '—'}
            </div>
            {supplier.contact_person && (
              <p className="mt-0.5 text-xs text-gray-500">{supplier.contact_person}</p>
            )}
          </Link>
        ))}
      </div>

      {/* Desktop table */}
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
                onClick={() => navigate(`/procurement-officer/suppliers/${row.original.id}`)}
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
