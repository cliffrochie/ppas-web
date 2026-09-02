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
import { useDebounce } from '@/hooks';
import type { PurchaseOrderStatus } from '@/types';
import { usePurchaseOrders, type PurchaseOrderFilters } from '../api/purchase-orders';
import { PO_STATUS_OPTIONS } from './po-status';
import { PurchaseOrdersTable } from './PurchaseOrdersTable';
import type { PurchaseOrderSortState } from './PurchaseOrdersTable';

const DEFAULT_PER_PAGE = 10;
const ALL = '__all__';

export const PurchaseOrdersList = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<PurchaseOrderSortState>({
    column: 'created_at',
    direction: 'desc',
  });

  const debouncedSearch = useDebounce(search, 300);

  const filters: PurchaseOrderFilters = {
    search: debouncedSearch || undefined,
    status: status === ALL ? undefined : (status as PurchaseOrderStatus),
    page,
    per_page: DEFAULT_PER_PAGE,
    sort_by: sortState.column,
    sort_order: sortState.direction,
  };

  const { data: response, isLoading, isError } = usePurchaseOrders(filters);

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
          <p className="text-sm text-destructive">Failed to load purchase orders. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-800">Purchase Orders</h2>
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
              aria-label="Search purchase orders"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="po_status_filter">Status</Label>
            <Select
              value={status}
              onValueChange={(val) => val && handleFilterChange(setStatus)(val)}
            >
              <SelectTrigger id="po_status_filter" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Statuses</SelectItem>
                {PO_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="px-2">
          <PurchaseOrdersTable
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
