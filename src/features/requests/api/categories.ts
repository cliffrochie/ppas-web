import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { ApiResponse, Category } from '@/types';

const categoriesApi = {
  list: async (): Promise<ApiResponse<Category[]>> => {
    const { data } = await api.get('/categories');
    return data;
  },
};

/**
 * Fetches the active category list used in the request create form.
 * staleTime of 5 min — categories are reference data that rarely change.
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'] as const,
    queryFn: categoriesApi.list,
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data,
  });
};
