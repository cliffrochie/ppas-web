import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRequests } from '../api/requests';
import type { RequestFilters, RequestSortState } from '../types';
import { RequestsPagination } from './RequestsPagination';
import { RequestsTable } from './RequestsTable';

const DEFAULT_PER_PAGE = 10;

export const RequestList = () => {
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
      {/* Controls row */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm sm:flex-1">
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

        <Button className="w-full gap-2 bg-green-700 text-white hover:bg-green-800 sm:w-auto">
          <Plus className="size-4" aria-hidden="true" />
          Create New Request
        </Button>
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
