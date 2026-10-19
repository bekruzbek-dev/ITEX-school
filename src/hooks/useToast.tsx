import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Kind = "success" | "error";
interface Toast {
  id: number;
  kind: Kind;
  text: string;
}
interface ToastValue {
  success: (text: string) => void;
  error: (text: string) => void;
}

const ToastContext = createContext<ToastValue | null>(null);
let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((kind: Kind, text: string) => {
    const id = ++seq;
    setItems((s) => [...s, { id, kind, text }]);
    window.setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4500);
  }, []);

  const value = useMemo<ToastValue>(
    () => ({ success: (t) => push("success", t), error: (t) => push("error", t) }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast faqat ToastProvider ichida ishlaydi");
  return ctx;
}
