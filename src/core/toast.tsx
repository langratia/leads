/* Toasts.

   Previously each screen hand-rolled its own: Inquiries.tsx had triggerToast and
   EmailChatThread.tsx had showToast, both string-only and both unable to carry a
   button. The Finder needs a toast with an Undo action on it, which neither could
   express, so this is the shared version.

   Deliberately additive — the two local toasts are left alone rather than migrated,
   because rewriting both screens is a much larger diff than the feature needs. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastTone = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  tone?: ToastTone;
  action?: ToastAction;
  /** Undo needs long enough to notice; confirmations do not. */
  durationMs?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  message: string;
}

interface ToastContextValue {
  push: (message: string, opts?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONES = {
  success: { icon: CheckCircle2, cls: "text-emerald-400" },
  error: { icon: AlertTriangle, cls: "text-rose-400" },
  info: { icon: Info, cls: "text-sky-400" },
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  /* One map of timers rather than a setTimeout call per render, so a dismiss
     mid-flight cannot leave a stale timer that fires against a recycled id. */
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, opts: ToastOptions = {}) => {
      const id = nextId.current++;
      const duration = opts.durationMs ?? 4000;
      setToasts((prev) => [...prev.slice(-2), { ...opts, id, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  /* Clearing on unmount stops a toast from calling setState on a dead tree. */
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => {
          const { icon: Icon, cls } = TONES[t.tone ?? "info"];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-slate-800/80 bg-[#0d121d] px-3.5 py-3 shadow-2xl animate-in slide-in-from-bottom duration-200"
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cls}`} />
              <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-slate-200">
                {t.message}
              </p>
              {t.action && (
                <button
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="shrink-0 cursor-pointer rounded-md border border-slate-700 bg-[#141b29] px-2 py-1 text-[11px] font-semibold text-slate-200 transition-colors hover:bg-[#182030] hover:text-white"
                >
                  {t.action.label}
                </button>
              )}
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 cursor-pointer rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/* Falls back to a no-op outside the provider so a screen rendered standalone
   still mounts instead of throwing. */
export function useToast(): ToastContextValue {
  return (
    useContext(ToastContext) ?? {
      push: () => {},
    }
  );
}