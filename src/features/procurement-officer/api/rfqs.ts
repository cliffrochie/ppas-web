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

// The `Create/UpdateRfqPayload` types (from `@/types`) still document a
// `file_path` field, but the backend's StoreRfqRequest/UpdateRfqRequest
// FormRequests actually accept a multipart `file` upload — `file_path` is
// derived server-side and is never accepted from the client. These Input
// types swap `file_path` for an optional `File` to match the real contract.
export type CreateRfqInput = Omit<CreateRfqPayload, 'file_path'> & { file?: File };
export type UpdateRfqInput = Omit<UpdateRfqPayload, 'file_path'> & { file?: File };

const buildRfqFormData = (payload: CreateRfqInput | UpdateRfqInput): FormData => {
  const formData = new FormData();
  if ('purchase_request_id' in payload && payload.purchase_request_id !== undefined) {
    formData.append('purchase_request_id', String(payload.purchase_request_id));
  }
  if (payload.prepared_by_id !== undefined) {
    formData.append('prepared_by_id', String(payload.prepared_by_id));
  }
  if (payload.deadline) formData.append('deadline', payload.deadline);
  if (payload.status) formData.append('status', payload.status);
  if (payload.file) formData.append('file', payload.file);
  return formData;
};

const rfqsApi = {
  list: async (filters: RfqFilters): Promise<PaginatedResponse<Rfq>> => {
    const { data } = await api.get('/rfqs', { params: filters });
    return data;
  },

  getOne: async (id: number): Promise<ApiResponse<Rfq>> => {
    const { data } = await api.get(`/rfqs/${id}`);
    return data;
  },

  create: async (payload: CreateRfqInput): Promise<ApiResponse<Rfq>> => {
    const { data } = await api.post('/rfqs', buildRfqFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: number, payload: UpdateRfqInput): Promise<ApiResponse<Rfq>> => {
    if (!payload.file) {
      // No new file — plain JSON PATCH (also the only way to null out `deadline`)
      const { data } = await api.patch(`/rfqs/${id}`, {
        prepared_by_id: payload.prepared_by_id,
        deadline: payload.deadline,
        status: payload.status,
      });
      return data;
    }

    // Replacing the file — multipart POST with Laravel method-spoofing
    const formData = buildRfqFormData(payload);
    formData.append('_method', 'PATCH');
    const { data } = await api.post(`/rfqs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    mutationFn: (payload: CreateRfqInput) => rfqsApi.create(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success(response.message);
    },
  });
};

export const useUpdateRfq = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRfqInput) => rfqsApi.update(id, payload),
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
