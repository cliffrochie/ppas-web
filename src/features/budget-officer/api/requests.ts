import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { ApiResponse, PurchaseRequest, UpdatePrStatusPayload } from '@/types';

const budgetOfficerRequestsApi = {
  updateStatus: async (
    id: number,
    payload: UpdatePrStatusPayload,
  ): Promise<ApiResponse<PurchaseRequest>> => {
    const { data } = await api.patch(`/purchase-requests/${id}`, payload);
    return data;
  },
};

export const useUpdateRequestStatus = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePrStatusPayload) =>
      budgetOfficerRequestsApi.updateStatus(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['requests', id] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast.success(response.message);
    },
  });
};
