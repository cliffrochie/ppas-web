import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/lib/auth';

const LoginPage = lazy(() => import('./routes/auth/login'));
const RegisterPage = lazy(() => import('./routes/auth/register'));
const AppRootLayout = lazy(() => import('./routes/app/root'));
const DashboardPage = lazy(() => import('./routes/app/dashboard'));
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
          { path: '/', element: withSuspense(<DashboardPage />) },
        ],
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
]);
