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

// StoreAbstractOfQuotationRequest/Update... accept a multipart `file` upload
// (nullable); `file_path` in the shared payload types is stale/server-derived.
export type CreateAbstractOfQuotationInput = Omit<
  CreateAbstractOfQuotationPayload,
  'file_path'
> & { file?: File };
export type UpdateAbstractOfQuotationInput = Omit<
  UpdateAbstractOfQuotationPayload,
  'file_path'
> & { file?: File };

const buildAbstractFormData = (
  payload: CreateAbstractOfQuotationInput | UpdateAbstractOfQuotationInput,
): FormData => {
  const formData = new FormData();
  if ('rfq_id' in payload && payload.rfq_id !== undefined) {
    formData.append('rfq_id', String(payload.rfq_id));
  }
  if (payload.prepared_by_id !== undefined) {
    formData.append('prepared_by_id', String(payload.prepared_by_id));
  }
  if (payload.recommended_supplier) {
    formData.append('recommended_supplier', payload.recommended_supplier);
  }
  if (payload.recommended_amount !== undefined && payload.recommended_amount !== null) {
    formData.append('recommended_amount', String(payload.recommended_amount));
  }
  if (payload.status) formData.append('status', payload.status);
  if (payload.approved_at) formData.append('approved_at', payload.approved_at);
  if (payload.file) formData.append('file', payload.file);
  return formData;
};

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
    payload: CreateAbstractOfQuotationInput,
  ): Promise<ApiResponse<AbstractOfQuotation>> => {
    const { data } = await api.post('/abstracts-of-quotation', buildAbstractFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (
    id: number,
    payload: UpdateAbstractOfQuotationInput,
  ): Promise<ApiResponse<AbstractOfQuotation>> => {
    if (!payload.file) {
      // No new file — plain JSON PATCH (also the only way to null out fields)
      const { data } = await api.patch(`/abstracts-of-quotation/${id}`, {
        prepared_by_id: payload.prepared_by_id,
        recommended_supplier: payload.recommended_supplier,
        recommended_amount: payload.recommended_amount,
        status: payload.status,
        approved_at: payload.approved_at,
      });
      return data;
    }

    // Replacing the file — multipart POST with Laravel method-spoofing
    const formData = buildAbstractFormData(payload);
    formData.append('_method', 'PATCH');
    const { data } = await api.post(`/abstracts-of-quotation/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    mutationFn: (payload: CreateAbstractOfQuotationInput) => abstractsApi.create(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['abstracts-of-quotation'] });
      toast.success(response.message);
    },
  });
};

export const useUpdateAbstractOfQuotation = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAbstractOfQuotationInput) => abstractsApi.update(id, payload),
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

// StoreBacResolutionRequest requires a multipart `file` upload on create;
// UpdateBacResolutionRequest requires it only when replacing the document.
// `file_path` in the shared payload types is stale/server-derived.
export type CreateBacResolutionInput = Omit<CreateBacResolutionPayload, 'file_path'> & {
  file: File;
};
export type UpdateBacResolutionInput = Omit<UpdateBacResolutionPayload, 'file_path'> & {
  file?: File;
};

const buildBacResolutionFormData = (
  payload: CreateBacResolutionInput | UpdateBacResolutionInput,
): FormData => {
  const formData = new FormData();
  if (payload.resolution_number) formData.append('resolution_number', payload.resolution_number);
  if ('abstract_of_quotation_id' in payload && payload.abstract_of_quotation_id !== undefined) {
    formData.append('abstract_of_quotation_id', String(payload.abstract_of_quotation_id));
  }
  if (payload.prepared_by_id !== undefined) {
    formData.append('prepared_by_id', String(payload.prepared_by_id));
  }
  if (payload.issued_at) formData.append('issued_at', payload.issued_at);
  if (payload.file) formData.append('file', payload.file);
  return formData;
};

const bacResolutionsApi = {
  list: async (filters: BacResolutionFilters): Promise<PaginatedResponse<BacResolution>> => {
    const { data } = await api.get('/bac-resolutions', { params: filters });
    return data;
  },

  getOne: async (id: number): Promise<ApiResponse<BacResolution>> => {
    const { data } = await api.get(`/bac-resolutions/${id}`);
    return data;
  },

  create: async (payload: CreateBacResolutionInput): Promise<ApiResponse<BacResolution>> => {
    const { data } = await api.post(
      '/bac-resolutions',
      buildBacResolutionFormData(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  update: async (
    id: number,
    payload: UpdateBacResolutionInput,
  ): Promise<ApiResponse<BacResolution>> => {
    if (!payload.file) {
      // No new file — plain JSON PATCH
      const { data } = await api.patch(`/bac-resolutions/${id}`, {
        resolution_number: payload.resolution_number,
        prepared_by_id: payload.prepared_by_id,
        issued_at: payload.issued_at,
      });
      return data;
    }

    // Replacing the file — multipart POST with Laravel method-spoofing
    const formData = buildBacResolutionFormData(payload);
    formData.append('_method', 'PATCH');
    const { data } = await api.post(`/bac-resolutions/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    mutationFn: (payload: CreateBacResolutionInput) => bacResolutionsApi.create(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bac-resolutions'] });
      toast.success(response.message);
    },
  });
};

export const useUpdateBacResolution = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBacResolutionInput) => bacResolutionsApi.update(id, payload),
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

// StoreNoticeOfAwardRequest requires a multipart `file` upload on create;
// Update requires it only when replacing the document. `file_path` in the
// shared payload types is stale/server-derived.
export type CreateNoticeOfAwardInput = Omit<CreateNoticeOfAwardPayload, 'file_path'> & {
  file: File;
};
export type UpdateNoticeOfAwardInput = Omit<UpdateNoticeOfAwardPayload, 'file_path'> & {
  file?: File;
};

const buildNoticeOfAwardFormData = (
  payload: CreateNoticeOfAwardInput | UpdateNoticeOfAwardInput,
): FormData => {
  const formData = new FormData();
  if (payload.noa_number) formData.append('noa_number', payload.noa_number);
  if ('bac_resolution_id' in payload && payload.bac_resolution_id !== undefined) {
    formData.append('bac_resolution_id', String(payload.bac_resolution_id));
  }
  if (payload.awarded_supplier) formData.append('awarded_supplier', payload.awarded_supplier);
  if (payload.awarded_amount !== undefined) {
    formData.append('awarded_amount', String(payload.awarded_amount));
  }
  if (payload.issued_at) formData.append('issued_at', payload.issued_at);
  if (payload.file) formData.append('file', payload.file);
  return formData;
};

const noticesOfAwardApi = {
  list: async (filters: NoticeOfAwardFilters): Promise<PaginatedResponse<NoticeOfAward>> => {
    const { data } = await api.get('/notices-of-award', { params: filters });
    return data;
  },

  getOne: async (id: number): Promise<ApiResponse<NoticeOfAward>> => {
    const { data } = await api.get(`/notices-of-award/${id}`);
    return data;
  },

  create: async (payload: CreateNoticeOfAwardInput): Promise<ApiResponse<NoticeOfAward>> => {
    const { data } = await api.post(
      '/notices-of-award',
      buildNoticeOfAwardFormData(payload),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  update: async (
    id: number,
    payload: UpdateNoticeOfAwardInput,
  ): Promise<ApiResponse<NoticeOfAward>> => {
    if (!payload.file) {
      // No new file — plain JSON PATCH
      const { data } = await api.patch(`/notices-of-award/${id}`, {
        noa_number: payload.noa_number,
        awarded_supplier: payload.awarded_supplier,
        awarded_amount: payload.awarded_amount,
        issued_at: payload.issued_at,
      });
      return data;
    }

    // Replacing the file — multipart POST with Laravel method-spoofing
    const formData = buildNoticeOfAwardFormData(payload);
    formData.append('_method', 'PATCH');
    const { data } = await api.post(`/notices-of-award/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    mutationFn: (payload: CreateNoticeOfAwardInput) => noticesOfAwardApi.create(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['notices-of-award'] });
      toast.success(response.message);
    },
  });
};

export const useUpdateNoticeOfAward = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateNoticeOfAwardInput) => noticesOfAwardApi.update(id, payload),
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
