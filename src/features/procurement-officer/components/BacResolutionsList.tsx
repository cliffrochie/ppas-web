import { Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { RequestsPagination } from '@/features/requests';
import { useAuthorization } from '@/lib/authorization';
import { useBacResolutions } from '../api/procurement';
import { BacResolutionCreateForm } from './BacResolutionCreateForm';
import { BacResolutionsTable } from './BacResolutionsTable';

export const BacResolutionsList = () => {
  const { hasRole } = useAuthorization();
  const canManage = hasRole(['procurement_officer']);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filters = { search: search || undefined, page };
  const { data: response, isLoading, isError } = useBacResolutions(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (isError) {
    return (
      <div className="min-h-full p-4 sm:p-6">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-destructive">Failed to load BAC resolutions. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-800">BAC Resolutions</h2>
          {canManage && <BacResolutionCreateForm />}
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
              aria-label="Search BAC resolutions"
            />
          </div>
        </div>

        <div className="px-2">
          <BacResolutionsTable data={response?.data ?? []} isLoading={isLoading} />
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
