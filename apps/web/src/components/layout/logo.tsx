import { Milk } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <Milk className="size-5" aria-hidden />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-semibold text-brand-foreground">Moderns Milk</p>
          <p className="text-[11px] text-brand-foreground/55">Admin Console</p>
        </div>
      )}
    </div>
  );
}
