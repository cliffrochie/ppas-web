import { Navigate, Outlet } from 'react-router-dom';
import { useAuthorization } from '@/lib/authorization';
import { useAuthStore } from '@/stores/authStore';

export const ProtectedRoute = () => {
  const { hasHydrated, isAuthenticated } = useAuthStore();

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

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

/**
 * Gates a route group to a set of roles. Assumes it is already nested inside
 * <ProtectedRoute /> — auth and hydration are handled there.
 */
export const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { hasRole } = useAuthorization();

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
