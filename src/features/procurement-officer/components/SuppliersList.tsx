import { Search } from 'lucide-react';
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
import { RequestsPagination, useCategories } from '@/features/requests';
import { useDebounce } from '@/hooks';
import { useSuppliers, type SupplierFilters } from '../api/suppliers';
import { SuppliersTable } from './SuppliersTable';
import type { SupplierSortState } from './SuppliersTable';

const DEFAULT_PER_PAGE = 10;
const ALL = '__all__';

const ACTIVE_FROM_VALUE: Record<string, 0 | 1 | undefined> = {
  [ALL]: undefined,
  active: 1,
  inactive: 0,
};

export const SuppliersList = () => {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SupplierSortState>({
    column: 'name',
    direction: 'asc',
  });

  const debouncedSearch = useDebounce(search, 300);
  const { data: categories } = useCategories();

  const filters: SupplierFilters = {
    search: debouncedSearch || undefined,
    is_active: ACTIVE_FROM_VALUE[active],
    category_id: category === ALL ? undefined : Number(category),
    page,
    per_page: DEFAULT_PER_PAGE,
    sort_by: sortState.column,
    sort_order: sortState.direction,
  };

  const { data: response, isLoading, isError } = useSuppliers(filters);

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

        <div className="flex flex-wrap items-end gap-3 px-5 py-4">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
              className="pl-8"
              aria-label="Search suppliers"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="supplier_status_filter">Status</Label>
            <Select
              value={active}
              onValueChange={(val) => val && handleFilterChange(setActive)(val)}
            >
              <SelectTrigger id="supplier_status_filter" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="supplier_category_filter">Category</Label>
            <Select
              value={category}
              onValueChange={(val) => val && handleFilterChange(setCategory)(val)}
            >
              <SelectTrigger id="supplier_category_filter" className="w-48">
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
