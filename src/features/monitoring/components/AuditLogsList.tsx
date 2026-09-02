import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequestsPagination } from '@/features/requests';
import { AuditEvent } from '@/types';
import { useAuditLogs } from '../api/audit-logs';
import type { AuditLogFilters } from '../types';
import { AuditLogsTable } from './AuditLogsTable';

const DEFAULT_PER_PAGE = 10;
const ALL_EVENTS = '__all__';

export const AuditLogsList = () => {
  const [event, setEvent] = useState<string>(ALL_EVENTS);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [page, setPage] = useState(1);

  const filters: AuditLogFilters = {
    event: event === ALL_EVENTS ? undefined : (event as AuditEvent),
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    ip_address: ipAddress || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
  };

  const { data: response, isLoading, isError } = useAuditLogs(filters);

  const handleFilterChange = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  if (isError) {
    return (
      <div className="min-h-full p-4 sm:p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-destructive">Failed to load audit logs. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-800">Audit Log</h2>
        </div>

        <div className="flex flex-wrap items-end gap-3 px-5 py-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="audit_event_filter">Event</Label>
            <Select
              value={event}
              onValueChange={(val) => val && handleFilterChange(setEvent)(val)}
            >
              <SelectTrigger id="audit_event_filter" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_EVENTS}>All Events</SelectItem>
                <SelectItem value={AuditEvent.Created}>Created</SelectItem>
                <SelectItem value={AuditEvent.Updated}>Updated</SelectItem>
                <SelectItem value={AuditEvent.Deleted}>Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="audit_date_from">Date From</Label>
            <Input
              id="audit_date_from"
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange(setDateFrom)(e.target.value)}
              className="w-40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="audit_date_to">Date To</Label>
            <Input
              id="audit_date_to"
              type="date"
              value={dateTo}
              onChange={(e) => handleFilterChange(setDateTo)(e.target.value)}
              className="w-40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="audit_ip_filter">IP Address</Label>
            <Input
              id="audit_ip_filter"
              type="text"
              placeholder="e.g. 192.168.1.1"
              value={ipAddress}
              onChange={(e) => handleFilterChange(setIpAddress)(e.target.value)}
              className="w-44"
            />
          </div>
        </div>

        <div className="px-2">
          <AuditLogsTable data={response?.data ?? []} isLoading={isLoading} />
        </div>

        {!isLoading && response?.meta && response.data.length > 0 && (
          <div className="border-t border-border px-2">
            <RequestsPagination meta={response.meta} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};
