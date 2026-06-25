import type { OrderStatus } from '@moderns-milk/contracts';
import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_META } from '@/lib/status';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];
  return (
    <Badge variant={meta.variant} dot>
      {meta.label}
    </Badge>
  );
}
