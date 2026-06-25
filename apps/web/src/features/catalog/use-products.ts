'use client';

import { useQuery } from '@tanstack/react-query';
import type { ListProductsQuery } from '@moderns-milk/contracts';
import { api } from '@/lib/api';

export function useProducts(query: ListProductsQuery = {}) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: ({ signal }) => api.catalog.listProducts(query, signal),
  });
}
