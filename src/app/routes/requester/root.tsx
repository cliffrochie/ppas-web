import { Outlet } from 'react-router-dom';
import { RequesterLayout } from '@/components/layouts';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

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
