import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// TODO: wire up full auth guard (hasHydrated check, isAuthenticated redirect, role gate)
// Blocked until the backend auth endpoints are connected to the frontend store.
// See: useAuthStore, Navigate — kept in comments below for reference.

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ProtectedRouteProps { }

export const ProtectedRoute = ({ }: ProtectedRouteProps) => {
  const { hasHydrated, isAuthenticated, user } = useAuthStore();

  if (!hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
