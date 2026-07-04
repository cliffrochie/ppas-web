import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { ApiResponse, Notification, PaginatedResponse } from '@/types';

export interface NotificationFilters {
  type?: string;
  is_read?: boolean;
  purchase_request_id?: number;
  page?: number;
}

const notificationsApi = {
  list: async (filters: NotificationFilters): Promise<PaginatedResponse<Notification>> => {
    const { data } = await api.get('/notifications', { params: filters });
    return data;
  },

  // No request body — the notification id in the URL is the only input.
  markRead: async (id: number): Promise<ApiResponse<Notification>> => {
    const { data } = await api.patch(`/notifications/${id}/mark-read`);
    return data;
  },
};

export const useNotifications = (filters: NotificationFilters = {}) =>
  useQuery({
    queryKey: ['notifications', filters] as const,
    queryFn: () => notificationsApi.list(filters),
    placeholderData: keepPreviousData,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      // Routine background action — no toast, it would be noisy for a click
      // that's already visually confirmed by the row's read state changing.
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
