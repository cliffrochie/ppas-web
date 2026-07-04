import { useState } from 'react';
import { Search } from 'lucide-react';
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
import { LoginStatus } from '@/types';
import { useLoginLogs } from '../api/login-logs';
import { LoginLogsTable } from './LoginLogsTable';
import type { LoginLogFilters } from '../types';

const DEFAULT_PER_PAGE = 10;
const ALL_STATUSES = '__all__';

export const LoginLogsList = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>(ALL_STATUSES);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const filters: LoginLogFilters = {
    search: search || undefined,
    status: status === ALL_STATUSES ? undefined : (status as LoginStatus),
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
  };

  const { data: response, isLoading, isError } = useLoginLogs(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (isError) {
    return (
      <div className="min-h-full p-4 sm:p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-destructive">Failed to load login logs. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-800">Login Log</h2>
        </div>

        <div className="flex flex-wrap items-end gap-3 px-5 py-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login_log_search">Search</Label>
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="login_log_search"
                type="search"
                placeholder="Search by email..."
                value={search}
                onChange={handleSearchChange}
                className="w-56 pl-8"
                aria-label="Search login logs by email"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login_log_status_filter">Status</Label>
            <Select
              value={status}
              onValueChange={(val) => {
                if (!val) return;
                setStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger id="login_log_status_filter" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>All Statuses</SelectItem>
                <SelectItem value={LoginStatus.Success}>Success</SelectItem>
                <SelectItem value={LoginStatus.Failed}>Failed</SelectItem>
                <SelectItem value={LoginStatus.LockedOut}>Locked Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login_log_date_from">Date From</Label>
            <Input
              id="login_log_date_from"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-40"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login_log_date_to">Date To</Label>
            <Input
              id="login_log_date_to"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-40"
            />
          </div>
        </div>

        <div className="px-2">
          <LoginLogsTable data={response?.data ?? []} isLoading={isLoading} />
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
