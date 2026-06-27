'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSalesVisits() {
  return useQuery({
    queryKey: ['sales-visits'],
    queryFn: ({ signal }) => api.salesVisits.list(signal),
  });
}
