import { useState, useEffect, useCallback, useRef } from "react";
import type { App } from "@modelcontextprotocol/ext-apps";

export type LiveDataStatus = "idle" | "connected" | "polling" | "paused" | "error";

export interface ViewLiveDataState<T> {
  data: T | null;
  status: LiveDataStatus;
  lastUpdated: number | null;
  updateCount: number;
  error: string | null;
  pause: () => void;
  resume: () => void;
  refresh: () => Promise<void>;
  reset: () => void;
}

interface UseViewLiveDataOptions<T> {
  app?: App | null;
  expectedType?: string;
  mergeStrategy?: "replace" | "shallow-merge" | ((existing: T | null, incoming: T) => T);
  pollingInterval?: number;
  pollingTool?: string;
  pollingArgs?: Record<string, unknown>;
  startPaused?: boolean;
  onUpdate?: (data: T, updateCount: number) => void;
}

/**
 * Continuous data updates hook with dual-mode support.
 *
 * Streaming mode: hooks into `app.ontoolinputpartial` to receive pushed updates.
 * Polling mode: calls `app.callServerTool` on an interval to fetch fresh data.
 * Both modes apply configurable merge strategies and support pause/resume.
 *
 * Usage:
 * ```tsx
 * const live = useViewLiveData<ServerStatus>({
 *   app,
 *   pollingInterval: 5000,
 *   mergeStrategy: "shallow-merge",
 * });
 * ```
 */
export function useViewLiveData<T>(
  options: UseViewLiveDataOptions<T> = {}
): ViewLiveDataState<T> {
  const {
    app = null,
    expectedType,
    mergeStrategy = "replace",
    pollingInterval = 0,
    pollingTool = "get-live-data",
    pollingArgs = {},
    startPaused = false,
    onUpdate,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<LiveDataStatus>("idle");
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pausedRef = useRef(startPaused);
  const onUpdateRef = useRef(onUpdate);
  const countRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  onUpdateRef.current = onUpdate;

  // ── Merge helper ───────────────────────────────────────────────────
  const applyMerge = useCallback(
    (incoming: T) => {
      if (mergeStrategy === "replace") {
        setData(incoming);
      } else if (mergeStrategy === "shallow-merge") {
        setData((prev) => (prev ? { ...prev, ...incoming } : incoming));
      } else {
        setData((prev) => mergeStrategy(prev, incoming));
      }
      countRef.current++;
      setUpdateCount(countRef.current);
      setLastUpdated(Date.now());
      setError(null);
      onUpdateRef.current?.(incoming, countRef.current);
    },
    [mergeStrategy]
  );

  // ── Single poll request ────────────────────────────────────────────
  const pollOnce = useCallback(async () => {
    if (!app) return;
    try {
      const result = await (app as App & { callServerTool: (req: unknown) => Promise<unknown> })
        .callServerTool({ name: pollingTool, arguments: pollingArgs });
      const incoming = result as T;
      if (pausedRef.current) return;
      applyMerge(incoming);
    } catch (err) {
      if (pausedRef.current) return;
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, [app, pollingTool, pollingArgs, applyMerge]);

  // ── Polling interval management ────────────────────────────────────
  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (pollingInterval <= 0 || !app) return;
    intervalRef.current = setInterval(pollOnce, pollingInterval);
    setStatus("polling");
  }, [pollingInterval, app, pollOnce]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── Streaming handler ──────────────────────────────────────────────
  useEffect(() => {
    if (!app) return;

    app.ontoolinputpartial = (params: { arguments?: Record<string, unknown> }) => {
      const partial = params.arguments as (T & { type?: string }) | undefined;
      if (!partial) return;
      if (expectedType && (partial as { type?: string }).type !== expectedType) return;
      if (pausedRef.current) return;
      applyMerge(partial as T);
      setStatus("connected");
    };

    if (!startPaused && pollingInterval > 0) {
      startPolling();
    }

    return () => {
      stopPolling();
      if (app) {
        app.ontoolinputpartial = undefined as unknown as typeof app.ontoolinputpartial;
      }
    };
  }, [app, expectedType, applyMerge, pollingInterval, startPaused, startPolling, stopPolling]);

  // ── Controls ───────────────────────────────────────────────────────
  const pause = useCallback(() => {
    pausedRef.current = true;
    stopPolling();
    setStatus("paused");
  }, [stopPolling]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    if (pollingInterval > 0) {
      startPolling();
    } else {
      setStatus(app ? "connected" : "idle");
    }
  }, [pollingInterval, startPolling, app]);

  const refresh = useCallback(async () => {
    await pollOnce();
  }, [pollOnce]);

  const reset = useCallback(() => {
    setData(null);
    countRef.current = 0;
    setUpdateCount(0);
    setLastUpdated(null);
    setError(null);
    pausedRef.current = false;
    stopPolling();
    if (pollingInterval > 0) {
      startPolling();
    } else {
      setStatus(app ? "connected" : "idle");
    }
  }, [pollingInterval, startPolling, stopPolling, app]);

  return { data, status, lastUpdated, updateCount, error, pause, resume, refresh, reset };
}
