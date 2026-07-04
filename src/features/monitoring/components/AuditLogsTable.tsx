import { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/utils';
import type { AuditEvent, AuditLog } from '@/types';

// ─── Event badge ──────────────────────────────────────────────────────────────

const EVENT_STYLES: Record<AuditEvent, string> = {
  created: 'bg-green-100 text-green-700',
  updated: 'bg-blue-100 text-blue-700',
  deleted: 'bg-red-100 text-red-700',
};

const EVENT_LABELS: Record<AuditEvent, string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
};

export const AuditEventBadge = ({ event }: { event: AuditEvent }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      EVENT_STYLES[event],
    )}
  >
    {EVENT_LABELS[event]}
  </span>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strips the `App\Models\` namespace prefix so the table shows just the model name. */
const formatAuditableType = (auditableType: string) =>
  auditableType.replace(/^App\\Models\\/, '');

const formatDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatUserName = (log: AuditLog) => {
  if (!log.user) return log.user_id ? `User #${log.user_id}` : 'System';
  return `${log.user.first_name} ${log.user.last_name}`;
};

// ─── Table ────────────────────────────────────────────────────────────────────

interface AuditLogsTableProps {
  data: AuditLog[];
  isLoading: boolean;
}

const columnHelper = createColumnHelper<AuditLog>();

const TABLE_COLUMNS = [
  { key: 'created_at', label: 'Date' },
  { key: 'user', label: 'User' },
  { key: 'event', label: 'Event' },
  { key: 'auditable_type', label: 'Model' },
  { key: 'field', label: 'Field' },
  { key: 'ip_address', label: 'IP Address' },
];

const SKELETON_ROWS = Array.from({ length: 8 });

export const AuditLogsTable = ({ data, isLoading }: AuditLogsTableProps) => {
  const [viewedLog, setViewedLog] = useState<AuditLog | null>(null);

  const columns = [
    columnHelper.accessor('created_at', {
      header: 'Date',
      cell: (info) => formatDateTime(info.getValue()),
    }),
    columnHelper.display({
      id: 'user',
      header: 'User',
      cell: ({ row }) => formatUserName(row.original),
    }),
    columnHelper.accessor('event', {
      header: 'Event',
      cell: (info) => <AuditEventBadge event={info.getValue()} />,
    }),
    columnHelper.accessor('auditable_type', {
      header: 'Model',
      cell: (info) => (
        <span>
          {formatAuditableType(info.getValue())} #{info.row.original.auditable_id}
        </span>
      ),
    }),
    columnHelper.accessor('field', {
      header: 'Field',
      cell: (info) => info.getValue() ?? '—',
    }),
    columnHelper.accessor('ip_address', {
      header: 'IP Address',
      cell: (info) => info.getValue() ?? '—',
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`View change detail for entry ${row.original.id}`}
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setViewedLog(row.original)}
        >
          <Eye />
        </Button>
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
              {TABLE_COLUMNS.map((col) => (
                <TableHead key={col.key} className="font-semibold text-foreground">
                  {col.label}
                </TableHead>
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
                No audit log entries found.
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
          <button
            key={log.id}
            type="button"
            onClick={() => setViewedLog(log)}
            className="block w-full px-4 py-3.5 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-gray-900">
                {formatAuditableType(log.auditable_type)} #{log.auditable_id}
              </span>
              <AuditEventBadge event={log.event} />
            </div>
            <p className="mt-1 text-sm text-gray-600">{formatUserName(log)}</p>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
              <span className="text-xs text-muted-foreground">{log.field ?? '—'}</span>
            </div>
          </button>
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

      <Dialog open={viewedLog !== null} onOpenChange={(open) => !open && setViewedLog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Detail</DialogTitle>
            <DialogDescription>
              {viewedLog && (
                <>
                  {formatAuditableType(viewedLog.auditable_type)} #{viewedLog.auditable_id} —{' '}
                  {viewedLog.field ?? 'record'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {viewedLog && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Old Value</p>
                <p className="mt-1 rounded-lg bg-muted/50 p-2 text-sm break-words">
                  {viewedLog.old_value ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">New Value</p>
                <p className="mt-1 rounded-lg bg-muted/50 p-2 text-sm break-words">
                  {viewedLog.new_value ?? '—'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
