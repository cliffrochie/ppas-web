import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  AbstractOfQuotation,
  AbstractStatus,
  CreateAbstractOfQuotationPayload,
  UpdateAbstractOfQuotationPayload,
  BacResolution,
  CreateBacResolutionPayload,
  UpdateBacResolutionPayload,
  NoticeOfAward,
  CreateNoticeOfAwardPayload,
  UpdateNoticeOfAwardPayload,
} from '@/types';

// ─── Abstract of Quotation ──────────────────────────────────────────────────

interface AbstractOfQuotationFilters {
  rfq_id?: number;
  prepared_by_id?: number;
  status?: AbstractStatus;
  search?: string;
  page?: number;
}

const abstractsApi = {
  list: async (
    filters: AbstractOfQuotationFilters,
  ): Promise<PaginatedResponse<AbstractOfQuotation>> => {
    const { data } = await api.get('/abstracts-of-quotation', { params: filters });
    return data;
  },

  getOne: async (id: number): Promise<ApiResponse<AbstractOfQuotation>> => {
    const { data } = await api.get(`/abstracts-of-quotation/${id}`);
    return data;
  },

  create: async (
    payload: CreateAbstractOfQuotationPayload,
  ): Promise<ApiResponse<AbstractOfQuotation>> => {
    const { data } = await api.post('/abstracts-of-quotation', payload);
    return data;
  },

  update: async (
    id: number,
    payload: UpdateAbstractOfQuotationPayload,
  ): Promise<ApiResponse<AbstractOfQuotation>> => {
    const { data } = await api.patch(`/abstracts-of-quotation/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/abstracts-of-quotation/${id}`);
    return data;
  },
};

export const useAbstractsOfQuotation = (filters: AbstractOfQuotationFilters = {}) =>
  useQuery({
    queryKey: ['abstracts-of-quotation', filters] as const,
    queryFn: () => abstractsApi.list(filters),
    placeholderData: keepPreviousData,
  });

export const useAbstractOfQuotation = (id: number) =>
  useQuery({
    queryKey: ['abstracts-of-quotation', id] as const,
    queryFn: () => abstractsApi.getOne(id),
    enabled: id > 0,
  });

export const useCreateAbstractOfQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAbstractOfQuotationPayload) => abstractsApi.create(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['abstracts-of-quotation'] });
      toast.success(response.message);
    },
  });
};

export const useUpdateAbstractOfQuotation = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAbstractOfQuotationPayload) => abstractsApi.update(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['abstracts-of-quotation', id] });
      queryClient.invalidateQueries({ queryKey: ['abstracts-of-quotation'] });
      toast.success(response.message);
    },
  });
};

export const useDeleteAbstractOfQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => abstractsApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['abstracts-of-quotation'] });
      toast.success(response.message);
    },
  });
};

// ─── BAC Resolutions ────────────────────────────────────────────────────────

interface BacResolutionFilters {
  abstract_of_quotation_id?: number;
  prepared_by_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}

const bacResolutionsApi = {
  list: async (filters: BacResolutionFilters): Promise<PaginatedResponse<BacResolution>> => {
    const { data } = await api.get('/bac-resolutions', { params: filters });
    return data;
  },

  getOne: async (id: number): Promise<ApiResponse<BacResolution>> => {
    const { data } = await api.get(`/bac-resolutions/${id}`);
    return data;
  },

  create: async (payload: CreateBacResolutionPayload): Promise<ApiResponse<BacResolution>> => {
    const { data } = await api.post('/bac-resolutions', payload);
    return data;
  },

  update: async (
    id: number,
    payload: UpdateBacResolutionPayload,
  ): Promise<ApiResponse<BacResolution>> => {
    const { data } = await api.patch(`/bac-resolutions/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/bac-resolutions/${id}`);
    return data;
  },
};

export const useBacResolutions = (filters: BacResolutionFilters = {}) =>
  useQuery({
    queryKey: ['bac-resolutions', filters] as const,
    queryFn: () => bacResolutionsApi.list(filters),
    placeholderData: keepPreviousData,
  });

export const useBacResolution = (id: number) =>
  useQuery({
    queryKey: ['bac-resolutions', id] as const,
    queryFn: () => bacResolutionsApi.getOne(id),
    enabled: id > 0,
  });

export const useCreateBacResolution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBacResolutionPayload) => bacResolutionsApi.create(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bac-resolutions'] });
      toast.success(response.message);
    },
  });
};

export const useUpdateBacResolution = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBacResolutionPayload) => bacResolutionsApi.update(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bac-resolutions', id] });
      queryClient.invalidateQueries({ queryKey: ['bac-resolutions'] });
      toast.success(response.message);
    },
  });
};

export const useDeleteBacResolution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bacResolutionsApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bac-resolutions'] });
      toast.success(response.message);
    },
  });
};

// ─── Notices of Award ───────────────────────────────────────────────────────

interface NoticeOfAwardFilters {
  bac_resolution_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}

const noticesOfAwardApi = {
  list: async (filters: NoticeOfAwardFilters): Promise<PaginatedResponse<NoticeOfAward>> => {
    const { data } = await api.get('/notices-of-award', { params: filters });
    return data;
  },

  getOne: async (id: number): Promise<ApiResponse<NoticeOfAward>> => {
    const { data } = await api.get(`/notices-of-award/${id}`);
    return data;
  },

  create: async (payload: CreateNoticeOfAwardPayload): Promise<ApiResponse<NoticeOfAward>> => {
    const { data } = await api.post('/notices-of-award', payload);
    return data;
  },

  update: async (
    id: number,
    payload: UpdateNoticeOfAwardPayload,
  ): Promise<ApiResponse<NoticeOfAward>> => {
    const { data } = await api.patch(`/notices-of-award/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/notices-of-award/${id}`);
    return data;
  },
};

export const useNoticesOfAward = (filters: NoticeOfAwardFilters = {}) =>
  useQuery({
    queryKey: ['notices-of-award', filters] as const,
    queryFn: () => noticesOfAwardApi.list(filters),
    placeholderData: keepPreviousData,
  });

export const useNoticeOfAward = (id: number) =>
  useQuery({
    queryKey: ['notices-of-award', id] as const,
    queryFn: () => noticesOfAwardApi.getOne(id),
    enabled: id > 0,
  });

export const useCreateNoticeOfAward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNoticeOfAwardPayload) => noticesOfAwardApi.create(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['notices-of-award'] });
      toast.success(response.message);
    },
  });
};

export const useUpdateNoticeOfAward = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateNoticeOfAwardPayload) => noticesOfAwardApi.update(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['notices-of-award', id] });
      queryClient.invalidateQueries({ queryKey: ['notices-of-award'] });
      toast.success(response.message);
    },
  });
};

export const useDeleteNoticeOfAward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => noticesOfAwardApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['notices-of-award'] });
      toast.success(response.message);
    },
  });
};
