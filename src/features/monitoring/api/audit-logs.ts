import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { AuditLog, PaginatedResponse } from '@/types';
import type { AuditLogFilters } from '../types';

const auditLogsApi = {
  list: async (filters: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> => {
    const { data } = await api.get('/audit-logs', { params: filters });
    return data;
  },
};

export const useAuditLogs = (filters: AuditLogFilters = {}) =>
  useQuery({
    queryKey: ['audit-logs', filters] as const,
    queryFn: () => auditLogsApi.list(filters),
    placeholderData: keepPreviousData,
  });
