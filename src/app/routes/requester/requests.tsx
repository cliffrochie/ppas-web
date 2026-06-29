import { RequestList } from '@/features/requests';

const RequestsPage = () => {
  return (
    <>
      {/* Green hero banner */}
      <div className="bg-green-800 px-4 py-6 sm:px-8 sm:py-8">
        <h1 className="text-2xl font-bold text-white">My Requests</h1>
      </div>

      {/* Content area */}
      <div className="bg-gray-100 min-h-[calc(100vh-4rem-4.5rem)] p-4 sm:p-8">
        <RequestList />
      </div>
    </>
  );
};

export default RequestsPage;
