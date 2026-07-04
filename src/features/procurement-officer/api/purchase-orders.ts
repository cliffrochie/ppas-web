import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse, PurchaseOrder, PurchaseOrderStatus } from '@/types';

interface PurchaseOrderFilters {
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

interface PoStatusPayload {
  status: PurchaseOrderStatus;
}

const purchaseOrdersApi = {
  list: async (filters: PurchaseOrderFilters): Promise<PaginatedResponse<PurchaseOrder>> => {
    const { data } = await api.get('/purchase-orders', { params: filters });
    return data;
  },

  getOne: async (id: number): Promise<ApiResponse<PurchaseOrder>> => {
    const { data } = await api.get(`/purchase-orders/${id}`);
    return data;
  },

  updateStatus: async (id: number, payload: PoStatusPayload): Promise<ApiResponse<PurchaseOrder>> => {
    const { data } = await api.patch(`/purchase-orders/${id}`, payload);
    return data;
  },
};

export const usePurchaseOrders = (filters: PurchaseOrderFilters = {}) =>
  useQuery({
    queryKey: ['purchase-orders', filters] as const,
    queryFn: () => purchaseOrdersApi.list(filters),
    placeholderData: keepPreviousData,
  });

export const usePurchaseOrder = (id: number) =>
  useQuery({
    queryKey: ['purchase-orders', id] as const,
    queryFn: () => purchaseOrdersApi.getOne(id),
  });

export const useUpdatePoStatus = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PoStatusPayload) => purchaseOrdersApi.updateStatus(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success(response.message);
    },
  });
};
