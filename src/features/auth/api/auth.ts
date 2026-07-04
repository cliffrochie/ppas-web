import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { queryClient } from '@/lib/react-query';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse } from '@/types';
import type {
  LoginCredentials,
  LoginResponseData,
  RegisterPayload,
  RegisterResponseData,
} from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponseData>> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  register: async (payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
};

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.user);
      navigate('/requests');
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      clearAuth();
      navigate('/login');
    },
    onError: () => {
      queryClient.clear();
      clearAuth();
      navigate('/login');
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      toast.success(response.message ?? 'Account created! Please sign in.');
      navigate('/login');
    },
  });
};
