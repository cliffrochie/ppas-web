import { Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useRequests, RequestsPagination } from '@/features/requests';
import type { RequestFilters, RequestSortState } from '@/features/requests';
import { BacRequestsTable } from './BacRequestsTable';

const DEFAULT_PER_PAGE = 10;

export const BacRequestList = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<RequestSortState>({
    column: 'submitted_at',
    direction: 'desc',
  });

  const filters: RequestFilters = {
    search: search || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
    sort_by: sortState.column,
    sort_dir: sortState.direction,
  };

  const { data: response, isLoading, isError } = useRequests(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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

      <div className="px-5 py-4">
        <div className="relative max-w-sm">
          <Search
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
            className="pl-8"
            aria-label="Search requests"
          />
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
