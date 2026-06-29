import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useRequest } from '@/features/requests';
import { RequestDetail } from '@/features/requests/components/RequestDetail';

const RequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const { data: response, isLoading, isError } = useRequest(numericId);

  return (
    <>
      {/* Green hero banner */}
      <div className="bg-green-800 px-4 py-6 sm:px-8 sm:py-8">
        <Link
          to="/requests"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to My Requests
        </Link>
        <h1 className="text-2xl font-bold text-white">Request Details</h1>
        <p className="mt-1 text-sm text-white/75">The details of the request submitted.</p>
      </div>

      {/* Content area */}
      <div className="min-h-[calc(100vh-4rem-9.5rem)] bg-gray-100 px-4 py-6 sm:px-8 sm:py-8">
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
              <Link to="/requests" className="underline">
                return to My Requests
              </Link>
              .
            </p>
          </div>
        )}

        {!isLoading && !isError && response?.data && (
          <RequestDetail request={response.data} />
        )}
      </div>
    </>
  );
};

export default RequestDetailPage;
