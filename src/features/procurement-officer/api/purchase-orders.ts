import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse, PaginatedResponse, PurchaseOrder, PurchaseOrderStatus } from '@/types';

interface CreatePurchaseOrderPayload {
  purchase_request_id: number;
  prepared_by_id?: number;
}

export interface PurchaseOrderFilters {
  search?: string;
  status?: PurchaseOrderStatus;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
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

  create: async (payload: CreatePurchaseOrderPayload): Promise<ApiResponse<PurchaseOrder>> => {
    const { data } = await api.post('/purchase-orders', payload);
    return data;
  },

  listForRequest: async (requestId: number): Promise<PaginatedResponse<PurchaseOrder>> => {
    const { data } = await api.get('/purchase-orders', {
      params: { purchase_request_id: requestId, per_page: 1 },
    });
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

/**
 * Generates the Purchase Order for a purchase request that has reached
 * `po_prepared`. `prepared_by_id` is the acting Procurement Officer.
 */
export const useGeneratePurchaseOrder = (requestId: number) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: () =>
      purchaseOrdersApi.create({
        purchase_request_id: requestId,
        prepared_by_id: user?.id,
      }),
    onSuccess: () => {
      toast.success('Purchase Order generated');
      queryClient.invalidateQueries({ queryKey: ['requests', requestId] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};

/**
 * Looks up the Purchase Order generated for this PR, if any. `PurchaseRequestResource`
 * doesn't embed a `purchase_order` relation — it's a separate resource, filtered here
 * by `purchase_request_id` (a supported filter on `GET /purchase-orders`). Only queried
 * once the PR has actually reached a PO-bearing status.
 */
export const usePurchaseOrderForRequest = (requestId: number, enabled: boolean) =>
  useQuery({
    queryKey: ['purchase-orders', { purchase_request_id: requestId }] as const,
    queryFn: () => purchaseOrdersApi.listForRequest(requestId),
    enabled,
  });
