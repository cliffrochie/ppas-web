import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  Rfq,
  RfqStatus,
  CreateRfqPayload,
  UpdateRfqPayload,
  RfqItem,
  CreateRfqItemPayload,
  UpdateRfqItemPayload,
  CanvassResponse,
  CreateCanvassResponsePayload,
  UpdateCanvassResponsePayload,
} from '@/types';

// ─── RFQs ───────────────────────────────────────────────────────────────────

interface RfqFilters {
  search?: string;
  status?: RfqStatus;
  prepared_by_id?: number;
  purchase_request_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
}

const rfqsApi = {
  list: async (filters: RfqFilters): Promise<PaginatedResponse<Rfq>> => {
    const { data } = await api.get('/rfqs', { params: filters });
    return data;
  },

  getOne: async (id: number): Promise<ApiResponse<Rfq>> => {
    const { data } = await api.get(`/rfqs/${id}`);
    return data;
  },

  create: async (payload: CreateRfqPayload): Promise<ApiResponse<Rfq>> => {
    const { data } = await api.post('/rfqs', payload);
    return data;
  },

  update: async (id: number, payload: UpdateRfqPayload): Promise<ApiResponse<Rfq>> => {
    const { data } = await api.patch(`/rfqs/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/rfqs/${id}`);
    return data;
  },
};

export const useRfqs = (filters: RfqFilters = {}) =>
  useQuery({
    queryKey: ['rfqs', filters] as const,
    queryFn: () => rfqsApi.list(filters),
    placeholderData: keepPreviousData,
  });

export const useRfq = (id: number) =>
  useQuery({
    queryKey: ['rfqs', id] as const,
    queryFn: () => rfqsApi.getOne(id),
    enabled: id > 0,
  });

export const useCreateRfq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRfqPayload) => rfqsApi.create(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success(response.message);
    },
  });
};

export const useUpdateRfq = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRfqPayload) => rfqsApi.update(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs', id] });
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success(response.message);
    },
  });
};

export const useDeleteRfq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rfqsApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success(response.message);
    },
  });
};

// ─── RFQ items ──────────────────────────────────────────────────────────────

interface RfqItemFilters {
  rfq_id?: number;
  pr_item_id?: number;
  page?: number;
}

const rfqItemsApi = {
  list: async (filters: RfqItemFilters): Promise<PaginatedResponse<RfqItem>> => {
    const { data } = await api.get('/rfq-items', { params: filters });
    return data;
  },

  create: async (payload: CreateRfqItemPayload): Promise<ApiResponse<RfqItem>> => {
    const { data } = await api.post('/rfq-items', payload);
    return data;
  },

  update: async (id: number, payload: UpdateRfqItemPayload): Promise<ApiResponse<RfqItem>> => {
    const { data } = await api.patch(`/rfq-items/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/rfq-items/${id}`);
    return data;
  },
};

export const useRfqItems = (filters: RfqItemFilters = {}) =>
  useQuery({
    queryKey: ['rfq-items', filters] as const,
    queryFn: () => rfqItemsApi.list(filters),
    enabled: !!filters.rfq_id,
    placeholderData: keepPreviousData,
  });

export const useCreateRfqItem = (rfqId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRfqItemPayload) => rfqItemsApi.create(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['rfq-items'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', rfqId] });
      toast.success(response.message);
    },
  });
};

export const useUpdateRfqItem = (id: number, rfqId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRfqItemPayload) => rfqItemsApi.update(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['rfq-items'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', rfqId] });
      toast.success(response.message);
    },
  });
};

export const useDeleteRfqItem = (rfqId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rfqItemsApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['rfq-items'] });
      queryClient.invalidateQueries({ queryKey: ['rfqs', rfqId] });
      toast.success(response.message);
    },
  });
};

// ─── Canvass responses ──────────────────────────────────────────────────────

interface CanvassResponseFilters {
  rfq_id?: number;
  rfq_item_id?: number;
  search?: string;
  page?: number;
}

const canvassResponsesApi = {
  list: async (filters: CanvassResponseFilters): Promise<PaginatedResponse<CanvassResponse>> => {
    const { data } = await api.get('/canvass-responses', { params: filters });
    return data;
  },

  create: async (payload: CreateCanvassResponsePayload): Promise<ApiResponse<CanvassResponse>> => {
    const { data } = await api.post('/canvass-responses', payload);
    return data;
  },

  update: async (
    id: number,
    payload: UpdateCanvassResponsePayload,
  ): Promise<ApiResponse<CanvassResponse>> => {
    const { data } = await api.patch(`/canvass-responses/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/canvass-responses/${id}`);
    return data;
  },
};

export const useCanvassResponses = (filters: CanvassResponseFilters = {}) =>
  useQuery({
    queryKey: ['canvass-responses', filters] as const,
    queryFn: () => canvassResponsesApi.list(filters),
    enabled: !!filters.rfq_id,
    placeholderData: keepPreviousData,
  });

export const useCreateCanvassResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCanvassResponsePayload) => canvassResponsesApi.create(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['canvass-responses'] });
      toast.success(response.message);
    },
  });
};

export const useUpdateCanvassResponse = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCanvassResponsePayload) => canvassResponsesApi.update(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['canvass-responses'] });
      toast.success(response.message);
    },
  });
};

export const useDeleteCanvassResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => canvassResponsesApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['canvass-responses'] });
      toast.success(response.message);
    },
  });
};
