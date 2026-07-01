'use client';

import * as React from 'react';
import { Plus, Gift } from 'lucide-react';
import type { SampleOrderDto } from '@moderns-milk/contracts';
import { useSampleOrders } from '@/features/sample-orders/use-sample-orders';
import { SampleOrderDialog } from '@/features/sample-orders/sample-order-dialog';
import { useAuth } from '@/lib/auth-context';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function SampleOrdersPage() {
  const { role } = useAuth();
  const canPlace = role === 'SALES_HEAD' || role === 'SALES_OFFICER';

  const [search, setSearch] = React.useState('');
  const [date, setDate] = React.useState('');
  const [formOpen, setFormOpen] = React.useState(false);

  const filters = React.useMemo(() => ({ search: search || undefined, date: date || undefined }), [search, date]);
  const { data, isLoading, isError, error } = useSampleOrders(filters);
  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sample orders"
        description="Free product allotted to prospective distributors and retailers."
        actions={
          canPlace ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus />
              Place sample order
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search by sales officer…"
            containerClassName="sm:max-w-xs"
          />
          <div className="sm:ml-auto">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Filter by delivery date"
              className="w-[170px]"
            />
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : isError ? (
            <EmptyState icon={Gift} title="Couldn’t load sample orders" description={(error as Error)?.message ?? 'Please try again.'} />
          ) : rows.length === 0 ? (
            <EmptyState icon={Gift} title="No sample orders yet" description="Sales staff record samples given to prospects here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prospect</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Distributor</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Placed by</TableHead>
                  <TableHead>Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r: SampleOrderDto) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.targetName}</TableCell>
                    <TableCell>
                      <Badge variant={r.targetType === 'DISTRIBUTOR' ? 'info' : 'muted'}>
                        {r.targetType === 'DISTRIBUTOR' ? 'Distributor' : 'Retailer'}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.distributorName ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.items.map((i) => `${i.productName} ×${i.qty}`).join(', ')}
                    </TableCell>
                    <TableCell>{r.placedBy}</TableCell>
                    <TableCell>{fmtDate(r.deliveryDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SampleOrderDialog open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
