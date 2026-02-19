import { useState, useCallback, useRef, useEffect } from "react";

export type ToastSeverity = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration: number | null;
  createdAt: number;
}

export interface ViewToastState {
  toasts: readonly ToastMessage[];
  toast: (message: string, options?: ToastOptions) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

interface ToastOptions {
  severity?: ToastSeverity;
  duration?: number | null;
}

interface UseViewToastOptions {
  defaultDuration?: number;
  maxToasts?: number;
}

// ── Hook ────────────────────────────────────────────────────────────

export function useViewToast(options: UseViewToastOptions = {}): ViewToastState {
  const { defaultDuration = 4000, maxToasts = 5 } = options;

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── Auto-dismiss effect ──────────────────────────────────────────

  useEffect(() => {
    const timers = timersRef.current;

    for (const t of toasts) {
      if (t.duration === null) continue;
      if (timers.has(t.id)) continue;

      const timeout = setTimeout(() => {
        timers.delete(t.id);
        setToasts((prev) => prev.filter((p) => p.id !== t.id));
      }, t.duration);

      timers.set(t.id, timeout);
    }

    // Clean up timers for toasts that no longer exist
    for (const [id, timeout] of timers) {
      if (!toasts.some((t) => t.id === id)) {
        clearTimeout(timeout);
        timers.delete(id);
      }
    }
  }, [toasts]);

  // Clean up all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timeout of timers.values()) {
        clearTimeout(timeout);
      }
      timers.clear();
    };
  }, []);

  // ── Core toast method ────────────────────────────────────────────

  const toast = useCallback(
    (message: string, opts?: ToastOptions): string => {
      const id = `toast-${idRef.current++}`;
      const severity = opts?.severity ?? "info";
      const duration = opts?.duration !== undefined ? opts.duration : defaultDuration;

      const entry: ToastMessage = {
        id,
        message,
        severity,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        const next = [...prev, entry];
        if (next.length > maxToasts) {
          return next.slice(next.length - maxToasts);
        }
        return next;
      });

      return id;
    },
    [defaultDuration, maxToasts]
  );

  // ── Convenience methods ──────────────────────────────────────────

  const success = useCallback(
    (message: string, duration?: number) =>
      toast(message, { severity: "success", duration }),
    [toast]
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      toast(message, { severity: "error", duration }),
    [toast]
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      toast(message, { severity: "warning", duration }),
    [toast]
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      toast(message, { severity: "info", duration }),
    [toast]
  );

  // ── Dismiss methods ──────────────────────────────────────────────

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return { toasts, toast, success, error, warning, info, dismiss, dismissAll };
}
