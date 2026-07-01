'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useOrderSummary(date: string) {
  return useQuery({
    queryKey: ['order-summary', date],
    queryFn: ({ signal }) => api.reports.orderSummary(date || undefined, signal),
  });
}
