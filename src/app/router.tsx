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
const BacRootLayout = lazy(() => import('./routes/bac/root'));
const BacDashboardPage = lazy(() => import('./routes/bac/dashboard'));
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
          { path: '/requests/:id', element: withSuspense(<RequestDetailPage />) },
        ],
      },
      {
        element: withSuspense(<BacRootLayout />),
        children: [
          { path: '/bac/dashboard', element: withSuspense(<BacDashboardPage />) },
        ],
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
]);
