import { useState, useEffect } from "react";
import type { App } from "@modelcontextprotocol/ext-apps";

export interface ViewStreamState<T> {
  data: T | null;
  isStreaming: boolean;
  progress: number | null;
}

interface UseViewStreamOptions {
  expectedType?: string;
}

/**
 * Progressive rendering hook for MCP Views.
 *
 * Hooks into `app.ontoolinputpartial` (partial "healed" JSON as it streams in)
 * and `app.ontoolinput` (complete arguments before tool result). These are
 * separate handler slots from `ontoolresult` (used by `useView`), so they
 * compose without conflict.
 *
 * Usage:
 * ```tsx
 * const { app, data: finalData } = useView<MyContent>("mytype", "1.0");
 * const stream = useViewStream<MyContent>(app, { expectedType: "mytype" });
 *
 * // Show streaming preview while data arrives, final data when complete
 * const displayData = stream.isStreaming ? stream.data : finalData;
 * ```
 */
export function useViewStream<T>(
  app: App | null,
  options: UseViewStreamOptions = {}
): ViewStreamState<T> {
  const { expectedType } = options;
  const [data, setData] = useState<T | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!app) return;

    app.ontoolinputpartial = (params: { arguments?: Record<string, unknown> }) => {
      const partial = params.arguments as (T & { type?: string }) | undefined;
      if (!partial) return;
      if (expectedType && (partial as { type?: string }).type !== expectedType) return;
      setData(partial as T);
      setIsStreaming(true);
    };

    app.ontoolinput = (params: { arguments?: Record<string, unknown> }) => {
      const input = params.arguments as (T & { type?: string }) | undefined;
      if (!input) return;
      if (expectedType && (input as { type?: string }).type !== expectedType) return;
      setData(input as T);
      setIsStreaming(false);
      setProgress(1);
    };
  }, [app, expectedType]);

  return { data, isStreaming, progress };
}
