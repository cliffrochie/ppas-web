import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/lib/auth';

const LandingPage = lazy(() => import('./routes/landing'));
const LoginPage = lazy(() => import('./routes/auth/login'));
const RegisterPage = lazy(() => import('./routes/auth/register'));
const AppRootLayout = lazy(() => import('./routes/app/root'));
const DashboardPage = lazy(() => import('./routes/app/dashboard'));
const RequesterRootLayout = lazy(() => import('./routes/requester/root'));
const RequestsPage = lazy(() => import('./routes/requester/requests'));
const RequestsCreatePage = lazy(() => import('./routes/requester/requests-create'));
const RequestDetailPage = lazy(() => import('./routes/requester/requests-detail'));
const RequestEditPage = lazy(() => import('./routes/requester/requests-edit'));
const BacRootLayout = lazy(() => import('./routes/bac/root'));
const BacDashboardPage = lazy(() => import('./routes/bac/dashboard'));
const BacRequestsPage = lazy(() => import('./routes/bac/requests'));
const BacRequestDetailPage = lazy(() => import('./routes/bac/requests-detail'));
const BudgetOfficerRootLayout = lazy(() => import('./routes/budget-officer/root'));
const BudgetOfficerDashboardPage = lazy(() => import('./routes/budget-officer/dashboard'));
const BudgetOfficerRequestsPage = lazy(() => import('./routes/budget-officer/requests'));
const BudgetOfficerRequestDetailPage = lazy(
  () => import('./routes/budget-officer/requests-detail'),
);
const ProcurementOfficerRootLayout = lazy(() => import('./routes/procurement-officer/root'));
const ProcurementDashboardPage = lazy(() => import('./routes/procurement-officer/dashboard'));
const ProcurementRequestsPage = lazy(() => import('./routes/procurement-officer/requests'));
const ProcurementRequestDetailPage = lazy(
  () => import('./routes/procurement-officer/requests-detail'),
);
const ProcurementPurchaseOrdersPage = lazy(
  () => import('./routes/procurement-officer/purchase-orders'),
);
const ProcurementPurchaseOrderDetailPage = lazy(
  () => import('./routes/procurement-officer/purchase-orders-detail'),
);
const ProcurementSuppliersPage = lazy(() => import('./routes/procurement-officer/suppliers'));
const ProcurementSupplierCreatePage = lazy(
  () => import('./routes/procurement-officer/suppliers-create'),
);
const ProcurementSupplierDetailPage = lazy(
  () => import('./routes/procurement-officer/suppliers-detail'),
);
const ProcurementSupplierEditPage = lazy(
  () => import('./routes/procurement-officer/suppliers-edit'),
);
const NotFoundPage = lazy(() => import('./routes/not-found'));

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <p className="text-muted-foreground text-sm">Loading...</p>
  </div>
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<LandingPage />),
  },
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/register',
    element: withSuspense(<RegisterPage />),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: withSuspense(<AppRootLayout />),
        children: [
          { path: '/dashboard', element: withSuspense(<DashboardPage />) },
        ],
      },
      {
        element: withSuspense(<RequesterRootLayout />),
        children: [
          { path: '/requests', element: withSuspense(<RequestsPage />) },
          { path: '/requests/new', element: withSuspense(<RequestsCreatePage />) },
          { path: '/requests/:id/edit', element: withSuspense(<RequestEditPage />) },
          { path: '/requests/:id', element: withSuspense(<RequestDetailPage />) },
        ],
      },
      {
        element: withSuspense(<BacRootLayout />),
        children: [
          { path: '/bac/dashboard', element: withSuspense(<BacDashboardPage />) },
          { path: '/bac/requests', element: withSuspense(<BacRequestsPage />) },
          { path: '/bac/requests/:id', element: withSuspense(<BacRequestDetailPage />) },
        ],
      },
      {
        element: withSuspense(<BudgetOfficerRootLayout />),
        children: [
          { path: '/budget-officer/dashboard', element: withSuspense(<BudgetOfficerDashboardPage />) },
          { path: '/budget-officer/requests', element: withSuspense(<BudgetOfficerRequestsPage />) },
          {
            path: '/budget-officer/requests/:id',
            element: withSuspense(<BudgetOfficerRequestDetailPage />),
          },
        ],
      },
      {
        element: withSuspense(<ProcurementOfficerRootLayout />),
        children: [
          {
            path: '/procurement-officer/dashboard',
            element: withSuspense(<ProcurementDashboardPage />),
          },
          {
            path: '/procurement-officer/requests',
            element: withSuspense(<ProcurementRequestsPage />),
          },
          {
            path: '/procurement-officer/requests/:id',
            element: withSuspense(<ProcurementRequestDetailPage />),
          },
          {
            path: '/procurement-officer/purchase-orders',
            element: withSuspense(<ProcurementPurchaseOrdersPage />),
          },
          {
            path: '/procurement-officer/purchase-orders/:id',
            element: withSuspense(<ProcurementPurchaseOrderDetailPage />),
          },
          {
            path: '/procurement-officer/suppliers',
            element: withSuspense(<ProcurementSuppliersPage />),
          },
          {
            path: '/procurement-officer/suppliers/create',
            element: withSuspense(<ProcurementSupplierCreatePage />),
          },
          {
            path: '/procurement-officer/suppliers/:id/edit',
            element: withSuspense(<ProcurementSupplierEditPage />),
          },
          {
            path: '/procurement-officer/suppliers/:id',
            element: withSuspense(<ProcurementSupplierDetailPage />),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
]);
