import { useAuthStore } from '@/stores/authStore';

export const useAuthorization = () => {
  const user = useAuthStore((state) => state.user);

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return { user, hasRole };
};
