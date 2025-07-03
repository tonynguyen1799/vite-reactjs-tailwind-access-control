// src/components/GlobalToaster.tsx
import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { setGlobalToast } from "@/lib/notify";

export function GlobalToaster() {
  const { toast } = useToast();

  // This effect runs once when the component mounts.
  // It "captures" the real toast function and makes it globally available.
  useEffect(() => {
    setGlobalToast(toast);
  }, [toast]);

  // Render the official shadcn/ui Toaster which handles the UI
  return <Toaster />;
}