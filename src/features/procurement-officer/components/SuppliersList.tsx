import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequestsPagination } from '@/features/requests';
import { useSuppliers } from '../api/suppliers';
import { SuppliersTable } from './SuppliersTable';
import type { SupplierSortState } from './SuppliersTable';

const DEFAULT_PER_PAGE = 10;

export const SuppliersList = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SupplierSortState>({
    column: 'name',
    direction: 'asc',
  });

  const filters = {
    search: search || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
    sort_by: sortState.column,
    sort_dir: sortState.direction,
  };

  const { data: response, isLoading, isError } = useSuppliers(filters);

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
      <div className="min-h-full p-4 sm:p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-destructive">Failed to load suppliers. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-800">Suppliers</h2>
          <Button
            className="bg-green-700 text-white hover:bg-green-800"
            render={<Link to="/procurement-officer/suppliers/create" />}
          >
            Create New Supplier
          </Button>
        </div>

        <div className="px-5 py-4">
          <div className="relative max-w-sm">
            <Search
              className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search suppliers..."
              value={search}
              onChange={handleSearchChange}
              className="pl-8"
              aria-label="Search suppliers"
            />
          </div>
        </div>

        <div className="px-2">
          <SuppliersTable
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
    </div>
  );
};
