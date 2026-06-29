import { CreateRequestForm } from '@/features/requests';

const RequestsCreatePage = () => {
  return (
    <>
      {/* Green hero banner — mirrors the My Requests page banner style */}
      <div className="bg-green-800 px-4 py-6 sm:px-8 sm:py-8">
        <h1 className="text-2xl font-bold text-white">New Purchase Request</h1>
        <p className="mt-1 text-sm text-white/75">
          Fill out the details below to initiate a purchase request. This form can be saved as
          draft.
        </p>
      </div>

      {/* Content area */}
      <div className="min-h-[calc(100vh-4rem-7rem)] bg-gray-100 px-4 py-6 sm:px-8 sm:py-8">
        <CreateRequestForm />
      </div>
    </>
  );
};

export default RequestsCreatePage;
