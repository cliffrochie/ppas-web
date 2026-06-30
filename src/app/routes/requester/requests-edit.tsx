import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRequest } from '@/features/requests';
import { CreateRequestForm } from '@/features/requests/components/CreateRequestForm';

const RequestEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { data: response, isLoading, isError } = useRequest(numericId);

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/requests" className="hover:text-gray-900">
            Requests
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="font-medium text-gray-900">Edit Request</span>
        </nav>
        <Button asChild className="bg-green-700 text-white hover:bg-green-800">
          <Link to={`/requests/${numericId}`}>Back</Link>
        </Button>
      </div>

      {isLoading && <div className="h-64 animate-pulse rounded-xl bg-white" />}
      {isError && (
        <p className="text-sm text-destructive">Failed to load request.</p>
      )}
      {!isLoading && !isError && response?.data && (
        <CreateRequestForm request={response.data} />
      )}
    </div>
  );
};

export default RequestEditPage;
