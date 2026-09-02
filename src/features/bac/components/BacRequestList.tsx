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
import {
  useCategories,
  useRequests,
  RequestsPagination,
  REQUEST_STATUS_OPTIONS,
} from '@/features/requests';
import type { RequestFilters, RequestSortState } from '@/features/requests';
import { useDebounce } from '@/hooks';
import type { PurchaseRequestStatus } from '@/types';
import { BacRequestsTable } from './BacRequestsTable';

const DEFAULT_PER_PAGE = 10;
const ALL = '__all__';

export const BacRequestList = () => {
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

  if (isError) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-destructive">Failed to load requests. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-800">Requests' Records</h2>
      </div>

      <div className="flex flex-wrap items-end gap-3 px-5 py-4">
        <div className="relative w-full max-w-sm">
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bac_request_status_filter">Status</Label>
          <Select
            value={status}
            onValueChange={(val) => val && handleFilterChange(setStatus)(val)}
          >
            <SelectTrigger id="bac_request_status_filter" className="w-48">
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
          <Label htmlFor="bac_request_category_filter">Category</Label>
          <Select
            value={category}
            onValueChange={(val) => val && handleFilterChange(setCategory)(val)}
          >
            <SelectTrigger id="bac_request_category_filter" className="w-48">
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

      <div className="px-2">
        <BacRequestsTable
          data={response?.data ?? []}
          isLoading={isLoading}
          sortState={sortState}
          onSortChange={handleSortChange}
        />
      </div>

      {!isLoading && response?.meta && response.data.length > 0 && (
        <div className="border-t border-border px-2">
          <RequestsPagination meta={response.meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};
