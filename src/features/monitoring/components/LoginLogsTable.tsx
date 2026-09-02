import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LoginLog, LoginStatus } from '@/types';
import { cn } from '@/utils';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<LoginStatus, string> = {
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  locked_out: 'bg-amber-100 text-amber-700',
};

const STATUS_LABELS: Record<LoginStatus, string> = {
  success: 'Success',
  failed: 'Failed',
  locked_out: 'Locked Out',
};

export const LoginStatusBadge = ({ status }: { status: LoginStatus }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      STATUS_STYLES[status],
    )}
  >
    {STATUS_LABELS[status]}
  </span>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatUserName = (log: LoginLog) => {
  if (!log.user) return '—';
  return `${log.user.first_name} ${log.user.last_name}`;
};

// ─── Table ────────────────────────────────────────────────────────────────────

interface LoginLogsTableProps {
  data: LoginLog[];
  isLoading: boolean;
}

const columnHelper = createColumnHelper<LoginLog>();

const TABLE_COLUMNS = [
  { key: 'created_at', label: 'Date' },
  { key: 'email', label: 'Email' },
  { key: 'user', label: 'User' },
  { key: 'status', label: 'Status' },
  { key: 'ip_address', label: 'IP Address' },
  { key: 'user_agent', label: 'User Agent' },
];

const SKELETON_ROWS = Array.from({ length: 8 });

export const LoginLogsTable = ({ data, isLoading }: LoginLogsTableProps) => {
  const columns = [
    columnHelper.accessor('created_at', {
      header: 'Date',
      cell: (info) => formatDateTime(info.getValue()),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
    }),
    columnHelper.display({
      id: 'user',
      header: 'User',
      cell: ({ row }) => formatUserName(row.original),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <LoginStatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('ip_address', {
      header: 'IP Address',
      cell: (info) => info.getValue() ?? '—',
    }),
    columnHelper.accessor('user_agent', {
      header: 'User Agent',
      cell: (info) => (
        <span className="block max-w-[16rem] truncate" title={info.getValue() ?? undefined}>
          {info.getValue() ?? '—'}
        </span>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
                    {col.label}
                  </TableHead>
                ))}
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
                <TableHead key={col.key} className="font-semibold text-foreground">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={TABLE_COLUMNS.length}
                className="py-12 text-center text-muted-foreground"
              >
                No login log entries found.
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
        {data.map((log) => (
          <div key={log.id} className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-gray-900">{log.email}</span>
              <LoginStatusBadge status={log.status} />
            </div>
            <p className="mt-1 text-sm text-gray-600">{formatUserName(log)}</p>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
              <span className="text-xs text-muted-foreground">{log.ip_address ?? '—'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getFlatHeaders().map((header) => (
                <TableHead key={header.id} className="font-semibold text-foreground">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
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
