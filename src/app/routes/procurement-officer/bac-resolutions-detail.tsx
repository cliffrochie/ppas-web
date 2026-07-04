import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBacResolution } from '@/features/procurement-officer/api/procurement';
import { BacResolutionDetail } from '@/features/procurement-officer/components/BacResolutionDetail';

const ProcurementBacResolutionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const { data: response, isLoading, isError } = useBacResolution(numericId);

  const label = response?.data?.resolution_number ?? `#${numericId}`;

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link to="/procurement-officer/bac-resolutions" className="hover:text-gray-900">
            BAC Resolutions
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="font-medium text-gray-900">{label}</span>
        </nav>
        <Button
          className="bg-green-700 text-white hover:bg-green-800"
          render={<Link to="/procurement-officer/bac-resolutions" />}
        >
          Back
        </Button>
      </div>

      <div className="mt-5">
        {isLoading && (
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-lg bg-white" />
            <div className="h-64 animate-pulse rounded-lg bg-white" />
          </div>
        )}

        {isError && !isLoading && (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-destructive">
              Failed to load BAC resolution. Please try again or{' '}
              <Link to="/procurement-officer/bac-resolutions" className="underline">
                return to BAC Resolutions
              </Link>
              .
            </p>
          </div>
        )}

        {!isLoading && !isError && response?.data && (
          <BacResolutionDetail resolution={response.data} />
        )}
      </div>
    </div>
  );
};

export default ProcurementBacResolutionDetailPage;
