import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  PurchaseRequest,
  PurchaseRequestItem,
  PrStatusHistory,
  UpdatePurchaseRequestPayload,
  CreatePurchaseRequestItemPayload,
} from '@/types';
import type { Request, RequestFilters, CreateRequestPayload } from '../types';

export const requestsApi = {
  list: async (filters: RequestFilters): Promise<PaginatedResponse<Request>> => {
    const { data } = await api.get('/purchase-requests', { params: filters });
    return data;
  },

  getRequest: async (id: number): Promise<ApiResponse<PurchaseRequest>> => {
    const { data } = await api.get(`/purchase-requests/${id}`);
    return data;
  },

  create: async (payload: CreateRequestPayload): Promise<ApiResponse<PurchaseRequest>> => {
    const { data } = await api.post('/purchase-requests', payload);
    return data;
  },

  update: async (id: number, payload: UpdatePurchaseRequestPayload): Promise<ApiResponse<PurchaseRequest>> => {
    const { data } = await api.patch(`/purchase-requests/${id}`, payload);
    return data;
  },

  /**
   * Creates a single purchase request line item. Called once per item, after the
   * parent purchase request has been created — the backend has no inline `items` field.
   */
  createItem: async (
    payload: CreatePurchaseRequestItemPayload,
  ): Promise<ApiResponse<PurchaseRequestItem>> => {
    const { data } = await api.post('/purchase-request-items', payload);
    return data;
  },

  deleteItem: async (itemId: number): Promise<void> => {
    await api.delete(`/purchase-request-items/${itemId}`);
  },

  deleteAttachment: async (attachmentId: number): Promise<void> => {
    await api.delete(`/pr-attachments/${attachmentId}`);
  },

  /**
   * Upload a single file attachment for an existing purchase request.
   * Called after a successful create so that the request ID is known.
   * `/pr-attachments` is a flat resource — the request id is sent in the body,
   * not the URL.
   */
  uploadAttachment: async (requestId: number, file: File, type = 'other'): Promise<void> => {
    const formData = new FormData();
    formData.append('purchase_request_id', String(requestId));
    formData.append('file', file);
    formData.append('type', type);
    await api.post('/pr-attachments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const useRequests = (filters: RequestFilters = {}) => {
  return useQuery({
    queryKey: ['requests', filters] as const,
    queryFn: () => requestsApi.list(filters),
    placeholderData: keepPreviousData,
  });
};

export const useRequest = (id: number) => {
  return useQuery({
    queryKey: ['requests', id] as const,
    queryFn: () => requestsApi.getRequest(id),
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestsApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success(response.message);
    },
  });
};

export const useUpdateRequest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePurchaseRequestPayload) => requestsApi.update(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['requests', id] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success(response.message);
    },
  });
};

/** Creates one PR line item. Not wired to toast/invalidate on its own — callers
 * (e.g. `CreateRequestForm`) batch several of these via `Promise.allSettled` and
 * invalidate/toast once after the whole batch settles. */
export const useCreatePurchaseRequestItem = () => {
  return useMutation({
    mutationFn: requestsApi.createItem,
  });
};

/**
 * Read-only audit trail for a purchase request's status transitions.
 * `GET /pr-status-histories` is a separate top-level resource (not embedded on
 * `PurchaseRequestResource`), filtered here by `purchase_request_id`.
 */
export const useRequestStatusHistories = (purchaseRequestId: number) => {
  return useQuery({
    queryKey: ['requests', purchaseRequestId, 'status-histories'] as const,
    queryFn: async (): Promise<PaginatedResponse<PrStatusHistory>> => {
      const { data } = await api.get('/pr-status-histories', {
        params: { purchase_request_id: purchaseRequestId },
      });
      return data;
    },
    enabled: purchaseRequestId > 0,
  });
};
