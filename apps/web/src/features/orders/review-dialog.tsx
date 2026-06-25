'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import type { OrderDto } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { useReviewOrder } from './use-orders';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ReviewDialogProps {
  order: OrderDto;
  decision: 'APPROVE' | 'REJECT' | null;
  onClose: () => void;
}

export function ReviewDialog({ order, decision, onClose }: ReviewDialogProps) {
  const review = useReviewOrder();
  const { toast } = useToast();
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (decision) setReason('');
  }, [decision]);

  const isReject = decision === 'REJECT';

  async function submit() {
    if (!decision) return;
    try {
      await review.mutateAsync({
        orderId: order.id,
        decision,
        reason: reason.trim() || undefined,
      });
      toast({
        variant: 'success',
        title: isReject ? 'Order rejected' : 'Order approved',
        description: `Order #${order.id.slice(-6).toUpperCase()} updated.`,
      });
      onClose();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Action failed',
        description: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }

  return (
    <Dialog open={Boolean(decision)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReject ? 'Reject this order?' : 'Approve this order?'}
          </DialogTitle>
          <DialogDescription>
            Order #{order.id.slice(-6).toUpperCase()} ·{' '}
            {order.items.length} item{order.items.length === 1 ? '' : 's'}.{' '}
            {isReject
              ? 'The retailer will be notified it was rejected.'
              : 'Approved quantities will be set from the ordered quantities.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reason">
            Reason {isReject ? '(recommended)' : '(optional)'}
          </Label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Add an internal note…"
            className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={review.isPending}>
            Cancel
          </Button>
          <Button
            variant={isReject ? 'destructive' : 'primary'}
            onClick={submit}
            loading={review.isPending}
          >
            {isReject ? <X /> : <Check />}
            {isReject ? 'Reject order' : 'Approve order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
