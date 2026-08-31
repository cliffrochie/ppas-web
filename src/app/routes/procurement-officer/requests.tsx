import { BacRequestList } from '@/features/bac';

const ProcurementRequestsPage = () => (
  <div className="min-h-full p-4 sm:p-6">
    <h1 className="text-xl font-semibold text-gray-800">Requests</h1>
    <div className="mt-5">
      <BacRequestList />
    </div>
  </div>
);

export default ProcurementRequestsPage;
