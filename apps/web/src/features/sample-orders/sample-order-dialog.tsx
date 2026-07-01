'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  createSampleOrderSchema,
  type SampleTargetType,
} from '@moderns-milk/contracts';
import { ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/features/catalog/use-products';
import { useOnboardedUsers } from '@/features/onboarding/use-onboarding';
import { useCreateSampleOrder } from './use-sample-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Line {
  productId: string;
  qty: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SampleOrderDialog({ open, onClose }: Props) {
  const { toast } = useToast();
  const createMut = useCreateSampleOrder();
  const products = useProducts({ active: true });
  const distributors = useOnboardedUsers('distributors', '');
  const retailers = useOnboardedUsers('retailers', '');

  const [targetType, setTargetType] = React.useState<SampleTargetType>('DISTRIBUTOR');
  const [targetId, setTargetId] = React.useState('');
  const [deliveryDate, setDeliveryDate] = React.useState(today());
  const [note, setNote] = React.useState('');
  const [lines, setLines] = React.useState<Line[]>([{ productId: '', qty: '' }]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setTargetType('DISTRIBUTOR');
      setTargetId('');
      setDeliveryDate(today());
      setNote('');
      setLines([{ productId: '', qty: '' }]);
      setErrors({});
    }
  }, [open]);

  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const addLine = () => setLines((ls) => [...ls, { productId: '', qty: '' }]);
  const removeLine = (i: number) => setLines((ls) => ls.filter((_, idx) => idx !== i));

  async function submit() {
    setErrors({});
    try {
      const input = createSampleOrderSchema.parse({
        targetType,
        distributorId: targetType === 'DISTRIBUTOR' ? targetId : undefined,
        retailerId: targetType === 'RETAILER' ? targetId : undefined,
        deliveryDate,
        note: note || undefined,
        items: lines
          .filter((l) => l.productId && l.qty)
          .map((l) => ({ productId: l.productId, qty: l.qty })),
      });
      await createMut.mutateAsync(input);
      toast({ title: 'Sample order recorded', variant: 'success' });
      onClose();
    } catch (err) {
      if (err && typeof err === 'object' && 'issues' in err) {
        const out: Record<string, string> = {};
        for (const issue of (err as { issues: { path: (string | number)[]; message: string }[] }).issues) {
          out[String(issue.path[0] ?? '_')] = issue.message;
        }
        setErrors(out);
        return;
      }
      const msg = err instanceof ApiError ? err.message : 'Something went wrong';
      toast({ title: 'Could not save', description: msg, variant: 'destructive' });
    }
  }

  const targetOptions =
    targetType === 'DISTRIBUTOR' ? distributors.data ?? [] : retailers.data ?? [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Place sample order</DialogTitle>
          <DialogDescription>
            Allot free product to a prospective distributor or retailer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Prospect type</Label>
              <Select
                value={targetType}
                onValueChange={(v) => {
                  setTargetType(v as SampleTargetType);
                  setTargetId('');
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
                  <SelectItem value="RETAILER">Retailer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{targetType === 'DISTRIBUTOR' ? 'Distributor' : 'Retailer'}<span className="text-destructive"> *</span></Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger><SelectValue placeholder="Select prospect" /></SelectTrigger>
                <SelectContent>
                  {targetOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {targetType === 'RETAILER' ? String(o.extra?.outlet ?? o.fullName) : o.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.distributorId || errors.retailerId ? (
                <p className="text-xs text-destructive">{errors.distributorId ?? errors.retailerId}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deliveryDate">Delivery date</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Products</Label>
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={line.productId} onValueChange={(v) => setLine(i, { productId: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Product" /></SelectTrigger>
                  <SelectContent>
                    {(products.data ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="w-24"
                  inputMode="decimal"
                  placeholder="Qty"
                  value={line.qty}
                  onChange={(e) => setLine(i, { qty: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLine(i)}
                  disabled={lines.length === 1}
                  aria-label="Remove line"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {errors.items ? <p className="text-xs text-destructive">{errors.items}</p> : null}
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="size-4" /> Add product
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createMut.isPending}>Cancel</Button>
          <Button onClick={submit} disabled={createMut.isPending}>
            {createMut.isPending ? 'Saving…' : 'Save sample order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
