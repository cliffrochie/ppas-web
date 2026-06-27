import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: {
    response?: {
      status?: number;
      data?: { message?: string };
      headers?: { 'retry-after'?: string };
    };
  }) => {
    const status = error.response?.status;
    const payload = error.response?.data ?? error;

    if (status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }

    if (status === 403) {
      toast.error((payload as { message?: string }).message ?? 'Access denied.');
    }

    if (status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'];
      toast.error(
        retryAfter
          ? `Too many requests. Try again in ${retryAfter} seconds.`
          : 'Too many requests. Please try again later.',
      );
    }

    if (status === 500) {
      toast.error((payload as { message?: string }).message ?? 'A server error occurred.');
    }

    return Promise.reject(payload);
  },
);
