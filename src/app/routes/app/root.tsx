import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';

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
