import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedResponse, User } from '@/types';

interface UsersListParams {
  page: number;
  per_page: number;
  search?: string;
}

const usersApi = {
  list: async (params: UsersListParams): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get('/users', { params });
    return data;
  },
};

/**
 * Fetches users page-by-page for the end-user combobox.
 * Accepts a server-side `search` term so only matching users are loaded.
 * Each page loads 10 users; the next page is fetched when the scroll
 * sentinel becomes visible (IntersectionObserver in the combobox component).
 * staleTime of 5 min — user records are reference data.
 */
export const useUsersInfinite = (search: string = '') => {
  return useInfiniteQuery({
    queryKey: ['users', { search }] as const,
    queryFn: ({ pageParam }) =>
      usersApi.list({
        page: pageParam as number,
        per_page: 10,
        ...(search && { search }),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};
