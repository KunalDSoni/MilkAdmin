'use client';

import * as React from 'react';
import { Package, PackageX, RotateCcw } from 'lucide-react';
import type { ProductCategory, ProductDto } from '@moderns-milk/contracts';
import { useProducts } from '@/features/catalog/use-products';
import { formatQty, humanizeEnum } from '@/lib/format';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

type CategoryFilter = ProductCategory | 'ALL';
type ActiveFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';

function CategoryBadge({ category }: { category: ProductCategory }) {
  return (
    <Badge variant={category === 'MILK' ? 'info' : 'secondary'}>{humanizeEnum(category)}</Badge>
  );
}

function ProductMeta({ p }: { p: ProductDto }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <CategoryBadge category={p.category} />
      {p.isReturnablePack && (
        <Badge variant="muted">
          <RotateCcw className="size-3" /> Returnable
        </Badge>
      )}
      {p.active ? (
        <Badge variant="success" dot>
          Active
        </Badge>
      ) : (
        <Badge variant="muted" dot>
          Inactive
        </Badge>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<CategoryFilter>('ALL');
  const [active, setActive] = React.useState<ActiveFilter>('ACTIVE');

  const query = React.useMemo(
    () => ({
      category: category === 'ALL' ? undefined : category,
      active: active === 'ALL' ? undefined : active === 'ACTIVE',
    }),
    [category, active],
  );
  const { data, isLoading, isError, error, refetch } = useProducts(query);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Catalog of milk and dairy SKUs available for ordering."
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search by name or SKU…"
            containerClassName="sm:max-w-xs"
          />
          <div className="flex gap-3 sm:ml-auto">
            <Select value={category} onValueChange={(v) => setCategory(v as CategoryFilter)}>
              <SelectTrigger className="w-[140px]" aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All categories</SelectItem>
                <SelectItem value="MILK">Milk</SelectItem>
                <SelectItem value="DAIRY">Dairy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={active} onValueChange={(v) => setActive(v as ActiveFilter)}>
              <SelectTrigger className="w-[130px]" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ALL">All status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon={PackageX}
              title="Couldn’t load products"
              description={(error as Error)?.message ?? 'Please try again.'}
              action={
                <button className="text-sm font-medium text-primary underline" onClick={() => refetch()}>
                  Retry
                </button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description={
                search ? 'Try a different search or filter.' : 'No products match these filters.'
              }
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Pack size</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Attributes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {p.sku}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatQty(p.packSize)} {humanizeEnum(p.uom)}
                        </TableCell>
                        <TableCell className="tabular-nums">{Number(p.taxRate)}%</TableCell>
                        <TableCell>
                          <ProductMeta p={p} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <ul className="divide-y divide-border md:hidden">
                {filtered.map((p) => (
                  <li key={p.id} className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{p.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                        {formatQty(p.packSize)} {humanizeEnum(p.uom)}
                      </span>
                    </div>
                    <ProductMeta p={p} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {!isLoading && !isError && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} product{filtered.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}
