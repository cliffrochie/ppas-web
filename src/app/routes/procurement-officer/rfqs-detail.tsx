import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRfq } from '@/features/procurement-officer/api/rfqs';
import { RfqDetail } from '@/features/procurement-officer/components/RfqDetail';

const ProcurementRfqDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const { data: response, isLoading, isError } = useRfq(numericId);

  const rfqLabel = response?.data?.rfq_number ?? `#${numericId}`;

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link to="/procurement-officer/rfqs" className="hover:text-gray-900">
            RFQs
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="font-medium text-gray-900">{rfqLabel}</span>
        </nav>
        <Button
          className="bg-green-700 text-white hover:bg-green-800"
          render={<Link to="/procurement-officer/rfqs" />}
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
              Failed to load RFQ. Please try again or{' '}
              <Link to="/procurement-officer/rfqs" className="underline">
                return to RFQs
              </Link>
              .
            </p>
          </div>
        )}

        {!isLoading && !isError && response?.data && <RfqDetail rfq={response.data} />}
      </div>
    </div>
  );
};

export default ProcurementRfqDetailPage;
