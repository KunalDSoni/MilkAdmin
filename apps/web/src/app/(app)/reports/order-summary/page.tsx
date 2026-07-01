'use client';

import * as React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import type { OrderSummaryDto } from '@moderns-milk/contracts';
import { useOrderSummary } from '@/features/reports/use-order-summary';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Build a CSV (opens in Excel) from the pivot and trigger a download. */
function exportCsv(summary: OrderSummaryDto) {
  const header = ['S.no', 'Product', 'UOM', ...summary.areas, 'Total'];
  const lines = [header.join(',')];
  summary.rows.forEach((r, i) => {
    const cells = [
      String(i + 1),
      `"${r.productName.replace(/"/g, '""')}"`,
      r.uom,
      ...summary.areas.map((a) => r.byArea[a] ?? '0'),
      r.total,
    ];
    lines.push(cells.join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `order-summary-${summary.date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OrderSummaryPage() {
  const [date, setDate] = React.useState(today());
  const { data, isLoading, isError, error } = useOrderSummary(date);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order summary"
        description="Area-wise product demand for production. Choose a date to view past summaries."
        actions={
          data && data.rows.length > 0 ? (
            <Button variant="outline" onClick={() => exportCsv(data)}>
              <Download />
              Export to Excel
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <label className="text-sm text-muted-foreground" htmlFor="date">Delivery date</label>
          <Input
            id="date"
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
            className="w-[170px]"
          />
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : isError ? (
            <EmptyState icon={FileSpreadsheet} title="Couldn’t load summary" description={(error as Error)?.message ?? 'Please try again.'} />
          ) : !data || data.rows.length === 0 ? (
            <EmptyState icon={FileSpreadsheet} title="No demand for this date" description="No submitted orders deliver on the selected date." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">S.no</TableHead>
                    <TableHead>Product</TableHead>
                    {data.areas.map((a) => (
                      <TableHead key={a} className="text-right">{a}</TableHead>
                    ))}
                    <TableHead className="text-right font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((r, i) => (
                    <TableRow key={r.productId}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">
                        {r.productName}
                        <span className="ml-1 text-xs text-muted-foreground">({r.uom})</span>
                      </TableCell>
                      {data.areas.map((a) => (
                        <TableCell key={a} className="text-right tabular-nums">{r.byArea[a] ?? '0'}</TableCell>
                      ))}
                      <TableCell className="text-right font-semibold tabular-nums">{r.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
