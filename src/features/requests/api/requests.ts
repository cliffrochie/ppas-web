import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse, PurchaseRequest, UpdatePurchaseRequestPayload } from '@/types';
import type { Request, RequestFilters, CreateRequestPayload } from '../types';

export const requestsApi = {
  list: async (filters: RequestFilters): Promise<PaginatedResponse<Request>> => {
    const { data } = await api.get('/requests', { params: filters });
    return data;
  },

  getRequest: async (id: number): Promise<ApiResponse<PurchaseRequest>> => {
    const { data } = await api.get(`/requests/${id}`);
    return data;
  },

  create: async (payload: CreateRequestPayload): Promise<ApiResponse<PurchaseRequest>> => {
    const { data } = await api.post('/requests', payload);
    return data;
  },

  update: async (id: number, payload: UpdatePurchaseRequestPayload): Promise<ApiResponse<PurchaseRequest>> => {
    const { data } = await api.patch(`/requests/${id}`, payload);
    return data;
  },

  deleteAttachment: async (requestId: number, attachmentId: number): Promise<void> => {
    await api.delete(`/requests/${requestId}/attachments/${attachmentId}`);
  },

  /**
   * Upload a single file attachment for an existing purchase request.
   * Called after a successful create so that the request ID is known.
   */
  uploadAttachment: async (requestId: number, file: File, type = 'other'): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    await api.post(`/requests/${requestId}/attachments`, formData, {
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
