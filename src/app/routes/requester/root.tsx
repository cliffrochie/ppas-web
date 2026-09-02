import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { RequesterLayout } from '@/components/layouts';

const RequesterRootLayout = () => {
  return (
    <RequesterLayout>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </RequesterLayout>
  );
};

export default RequesterRootLayout;
