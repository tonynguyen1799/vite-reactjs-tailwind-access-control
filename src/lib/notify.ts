import type { ReactNode } from 'react';
import type { ToastActionElement } from '@/components/ui/toast';

export interface NotifyProps {
  title?: ReactNode;
  description?: ReactNode;
  variant?: 'default' | 'destructive';
  action?: ToastActionElement;
}

const toastState: {
  toast: (props: NotifyProps) => void;
} = {
  toast: () => {
    // This is a fallback in case a toast is called before the toaster is ready.
  },
};

export function globalNotify(props: NotifyProps) {
  toastState.toast(props);
}

export function setGlobalToast(toastFn: (props: NotifyProps) => void) {
  toastState.toast = toastFn;
}