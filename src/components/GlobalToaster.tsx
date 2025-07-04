import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { setGlobalToast } from "@/lib/notify";

export function GlobalToaster() {
  const { toast } = useToast();

  useEffect(() => {
    setGlobalToast(toast);
  }, [toast]);

  return <Toaster />;
}