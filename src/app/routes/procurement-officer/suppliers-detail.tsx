import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSupplier } from '@/features/procurement-officer/api/suppliers';
import { SupplierDetail } from '@/features/procurement-officer/components/SupplierDetail';

const ProcurementSupplierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const { data: response, isLoading, isError } = useSupplier(numericId);

  const supplierName = response?.data?.name ?? `#${numericId}`;

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link to="/procurement-officer/suppliers" className="hover:text-gray-900">
            Suppliers
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="font-medium text-gray-900">Supplier Info</span>
        </nav>
        <Button asChild className="bg-green-700 text-white hover:bg-green-800">
          <Link to="/procurement-officer/suppliers">Back</Link>
        </Button>
      </div>

      <div className="mt-5">
        {isLoading && (
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-lg bg-white" />
            <div className="h-64 animate-pulse rounded-lg bg-white" />
          </div>
        )}

        {isError && !isLoading && (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-destructive">
              Failed to load supplier. Please try again or{' '}
              <Link to="/procurement-officer/suppliers" className="underline">
                return to Suppliers
              </Link>
              .
            </p>
          </div>
        )}

        {!isLoading && !isError && response?.data && (
          <SupplierDetail supplier={response.data} />
        )}
      </div>

      {/* Suppress unused variable warning from TypeScript */}
      <span className="sr-only">{supplierName}</span>
    </div>
  );
};

export default ProcurementSupplierDetailPage;
