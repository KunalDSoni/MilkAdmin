'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateSampleOrderInput } from '@moderns-milk/contracts';
import { api } from '@/lib/api';

export function useSampleOrders(filters: { search?: string; date?: string }) {
  return useQuery({
    queryKey: ['sample-orders', filters],
    queryFn: ({ signal }) => api.sampleOrders.list(filters, signal),
  });
}

export function useCreateSampleOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSampleOrderInput) => api.sampleOrders.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sample-orders'] }),
  });
}
