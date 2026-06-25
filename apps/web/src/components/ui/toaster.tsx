'use client';

import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

const ICONS = {
  success: <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />,
  destructive: <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />,
  default: <Info className="mt-0.5 size-5 shrink-0 text-primary" />,
};

export function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, variant, ...props }) => (
        <Toast key={id} variant={variant} {...props}>
          {ICONS[(variant as keyof typeof ICONS) ?? 'default'] ?? ICONS.default}
          <div className="grid gap-0.5">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
