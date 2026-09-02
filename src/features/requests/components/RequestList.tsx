import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks';
import type { PurchaseRequestStatus } from '@/types';
import { useCategories } from '../api/categories';
import { useRequests } from '../api/requests';
import type { RequestFilters, RequestSortState } from '../types';
import { REQUEST_STATUS_OPTIONS } from './request-status';
import { RequestsPagination } from './RequestsPagination';
import { RequestsTable } from './RequestsTable';

const DEFAULT_PER_PAGE = 10;
const ALL = '__all__';

export const RequestList = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<RequestSortState>({
    column: 'submitted_at',
    direction: 'desc',
  });

  const debouncedSearch = useDebounce(search, 300);
  const { data: categories } = useCategories();

  const filters: RequestFilters = {
    search: debouncedSearch || undefined,
    status: status === ALL ? undefined : (status as PurchaseRequestStatus),
    category_id: category === ALL ? undefined : Number(category),
    page,
    per_page: DEFAULT_PER_PAGE,
    sort_by: sortState.column,
    sort_order: sortState.direction,
  };

  const { data: response, isLoading, isError } = useRequests(filters);

  // Any search/filter change returns to the first page.
  const handleFilterChange =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const handleSortChange = (column: string) => {
    setSortState((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isError) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-destructive">
          Failed to load requests. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm">
      {/* Controls */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm sm:flex-1">
            <Search
              className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
              className="pl-8"
              aria-label="Search requests"
            />
          </div>

          <Button
            className="w-full gap-2 bg-green-700 text-white hover:bg-green-800 sm:ml-auto sm:w-auto"
            render={<Link to="/requests/new" />}
          >
            <Plus className="size-4" aria-hidden="true" />
            Create New Request
          </Button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request_status_filter">Status</Label>
            <Select
              value={status}
              onValueChange={(val) => val && handleFilterChange(setStatus)(val)}
            >
              <SelectTrigger id="request_status_filter" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Statuses</SelectItem>
                {REQUEST_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request_category_filter">Category</Label>
            <Select
              value={category}
              onValueChange={(val) => val && handleFilterChange(setCategory)(val)}
            >
              <SelectTrigger id="request_category_filter" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Categories</SelectItem>
                {(categories ?? []).map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-2">
        <RequestsTable
          data={response?.data ?? []}
          isLoading={isLoading}
          sortState={sortState}
          onSortChange={handleSortChange}
        />
      </div>

      {/* Pagination */}
      {!isLoading && response?.meta && response.data.length > 0 && (
        <div className="border-t border-border px-2">
          <RequestsPagination
            meta={response.meta}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};
