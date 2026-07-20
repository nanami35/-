"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastCtx = createContext<{ toast: (message: string, kind?: ToastKind) => void }>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastCtx);
}

let seq = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = seq++;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-2 rounded-lg bg-white px-4 py-3 text-sm shadow-panel ring-1 ring-inset",
              t.kind === "success" && "ring-green-200",
              t.kind === "error" && "ring-red-200",
              t.kind === "info" && "ring-sky-200",
            )}
          >
            {t.kind === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />}
            {t.kind === "error" && <AlertTriangle className="mt-0.5 h-4 w-4 text-danger" />}
            {t.kind === "info" && <Info className="mt-0.5 h-4 w-4 text-info" />}
            <span className="max-w-xs text-ink">{t.message}</span>
            <button onClick={() => remove(t.id)} className="ml-1 text-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
