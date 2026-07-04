import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type {
  ApiResponse,
  PaginatedResponse,
  Supplier,
  SupplierDocument,
  CreateSupplierPayload,
  CreateSupplierDocumentPayload,
} from '@/types';

interface SupplierFilters {
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

const suppliersApi = {
  list: async (filters: SupplierFilters): Promise<PaginatedResponse<Supplier>> => {
    const { data } = await api.get('/suppliers', { params: filters });
    return data;
  },

  getOne: async (id: number): Promise<ApiResponse<Supplier>> => {
    const { data } = await api.get(`/suppliers/${id}`);
    return data;
  },

  create: async (formData: FormData): Promise<ApiResponse<Supplier>> => {
    const { data } = await api.post('/suppliers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: number, payload: Partial<CreateSupplierPayload>): Promise<ApiResponse<Supplier>> => {
    const { data } = await api.patch(`/suppliers/${id}`, payload);
    return data;
  },

  uploadDocument: async (
    payload: CreateSupplierDocumentPayload,
  ): Promise<ApiResponse<SupplierDocument>> => {
    const formData = new FormData();
    formData.append('supplier_id', String(payload.supplier_id));
    formData.append('file', payload.file);
    const { data } = await api.post('/supplier-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export const useSuppliers = (filters: SupplierFilters = {}) =>
  useQuery({
    queryKey: ['suppliers', filters] as const,
    queryFn: () => suppliersApi.list(filters),
    placeholderData: keepPreviousData,
  });

export const useSupplier = (id: number) =>
  useQuery({
    queryKey: ['suppliers', id] as const,
    queryFn: () => suppliersApi.getOne(id),
  });

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => suppliersApi.create(formData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(response.message);
    },
  });
};

export const useUpdateSupplier = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CreateSupplierPayload>) => suppliersApi.update(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', id] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(response.message);
    },
  });
};

// Supplier documents don't exist until the parent supplier does (`supplier_id`
// is a required FK) — call this once per file after `useCreateSupplier`
// succeeds, not as part of the create FormData itself.
export const useUploadSupplierDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSupplierDocumentPayload) => suppliersApi.uploadDocument(payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', variables.supplier_id] });
    },
  });
};
