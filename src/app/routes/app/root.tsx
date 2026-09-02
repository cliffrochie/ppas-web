import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { DashboardLayout } from '@/components/layouts';

const AppRootLayout = () => {
  return (
    <DashboardLayout>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default AppRootLayout;
