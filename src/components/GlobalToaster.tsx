import { useEffect, type ReactNode } from 'react';
import type { ToastActionElement } from '@/components/ui/toast'; // Import the correct type
import { useToast } from '@/hooks/use-toast';
import { Toaster } from './ui/toaster';
import { setGlobalToast } from '@/lib/notify';

export interface NotifyProps {
  title?: ReactNode; // Make title optional
  description?: ReactNode;
  variant?: 'default' | 'destructive';
  action?: ToastActionElement; // Use the specific ToastActionElement type
}

export function GlobalToaster() {
  const { toast } = useToast();
  useEffect(() => {
    setGlobalToast((props) => {
      // Cast title and description to string | undefined to match Toast type
      const { title, description, ...rest } = props;
      toast({
        ...rest,
        title: title ? String(title) : undefined,
        description: description ? String(description) : undefined,
      });
    });
  }, [toast]);

  return <Toaster />;
}