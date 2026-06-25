import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { Skeleton } from './skeleton';

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: string;
  trend?: { value: string; direction: 'up' | 'down' | 'flat' };
  loading?: boolean;
  className?: string;
}

export function KpiCard({ label, value, icon: Icon, hint, trend, loading, className }: KpiCardProps) {
  return (
    <Card className={cn('p-5 animate-fade-in', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-[18px]" aria-hidden />
        </div>
      </div>
      <div className="mt-3">
        {loading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        )}
      </div>
      {(hint || trend) && !loading && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {trend && trend.direction !== 'flat' && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium',
                trend.direction === 'up' ? 'text-success' : 'text-destructive',
              )}
            >
              {trend.direction === 'up' ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {trend.value}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
