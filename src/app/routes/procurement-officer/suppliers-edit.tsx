import { useParams } from 'react-router-dom';
import { useSupplier } from '@/features/procurement-officer/api/suppliers';
import { SupplierCreateForm } from '@/features/procurement-officer/components/SupplierCreateForm';

const SupplierEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { data: response, isLoading, isError } = useSupplier(numericId);

  return (
    <div className="min-h-full">
      {isLoading && <div className="m-4 h-64 animate-pulse rounded-xl bg-white sm:m-6" />}
      {isError && (
        <p className="m-4 text-sm text-destructive sm:m-6">Failed to load supplier.</p>
      )}
      {!isLoading && !isError && response?.data && (
        <SupplierCreateForm supplier={response.data} />
      )}
    </div>
  );
};

export default SupplierEditPage;
