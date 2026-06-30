import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRequest } from '@/features/requests';
import { BacRequestDetail } from '@/features/bac/components/BacRequestDetail';

const BacRequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const { data: response, isLoading, isError } = useRequest(numericId);

  const rfLabel = response?.data?.rf_number ?? `#${numericId}`;

  return (
    <div className="min-h-full p-4 sm:p-6">
      {/* Breadcrumb + Back */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link to="/bac/requests" className="hover:text-gray-900">
            Requests
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="font-medium text-gray-900">Request # {rfLabel}</span>
        </nav>
        <Button asChild className="bg-green-700 text-white hover:bg-green-800">
          <Link to="/bac/requests">Back</Link>
        </Button>
      </div>

      {/* Content */}
      <div className="mt-5">
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg bg-white" />
              ))}
            </div>
            <div className="flex flex-col gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg bg-white" />
              ))}
            </div>
          </div>
        )}

        {isError && !isLoading && (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-destructive">
              Failed to load request details. Please try again or{' '}
              <Link to="/bac/requests" className="underline">
                return to Requests
              </Link>
              .
            </p>
          </div>
        )}

        {!isLoading && !isError && response?.data && (
          <BacRequestDetail request={response.data} />
        )}
      </div>
    </div>
  );
};

export default BacRequestDetailPage;
