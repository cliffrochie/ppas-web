import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { LoginLog, PaginatedResponse } from '@/types';
import type { LoginLogFilters } from '../types';

const loginLogsApi = {
  list: async (filters: LoginLogFilters): Promise<PaginatedResponse<LoginLog>> => {
    const { data } = await api.get('/login-logs', { params: filters });
    return data;
  },
};

export const useLoginLogs = (filters: LoginLogFilters = {}) =>
  useQuery({
    queryKey: ['login-logs', filters] as const,
    queryFn: () => loginLogsApi.list(filters),
    placeholderData: keepPreviousData,
  });
