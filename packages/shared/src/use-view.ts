import { useState, useEffect, useCallback } from "react";
import {
  useApp,
  useHostStyles,
  useDocumentTheme,
} from "@modelcontextprotocol/ext-apps/react";
import type { App } from "@modelcontextprotocol/ext-apps";
import { applyTheme, applyPreset } from "./theme";

interface ViewState<T> {
  app: App | null;
  data: T | null;
  content: Array<{ type: string; text?: string }> | null;
  theme: "light" | "dark";
  isConnected: boolean;
  error: string | null;
  callTool: (name: string, args: Record<string, unknown>) => Promise<void>;
}

/**
 * React hook for MCP View components.
 *
 * Wraps useApp with view-specific setup:
 * - Validates structuredContent.type matches expectedType
 * - Applies host styles and theme
 * - Provides typed data access
 * - Handles fallback state
 * - Listens for update-structured-content messages from parent dashboard
 */
export function useView<T>(
  expectedType: string,
  // Reserved for future schema version negotiation; part of the public API surface.
  _expectedVersion: string
): ViewState<T> {
  // Check for SSR-embedded data (server-side rendered views inject data via script tag).
  // Falls back to URL hash data (playground embeds data in hash).
  // Both are synchronous — no timing issues with postMessage.
  const initialData = (() => {
    // SSR data takes priority
    const ssrData = (window as any).__SSR_DATA__;
    if (ssrData && typeof ssrData === "object" && ssrData.type === expectedType) {
      return ssrData as T;
    }
    // Hash data fallback (playground)
    try {
      const hash = window.location.hash;
      if (!hash || hash.length < 2) return null;
      const raw = JSON.parse(decodeURIComponent(hash.slice(1)));
      if (raw && typeof raw === "object" && raw.type === expectedType) {
        return raw as T;
      }
    } catch { /* not hash-encoded data */ }
    return null;
  })();
  const hashData = initialData;

  const [data, setData] = useState<T | null>(hashData);
  const [content, setContent] = useState<Array<{
    type: string;
    text?: string;
  }> | null>(null);
  const [callToolError, setCallToolError] = useState<string | null>(null);
  // Track whether data arrived via dashboard postMessage or hash (bypasses ext-apps)
  const [dashboardConnected, setDashboardConnected] = useState(hashData !== null);

  const { app, isConnected: extAppsConnected, error } = useApp({
    appInfo: {
      name: `@chuk/view-${expectedType}`,
      version: "1.0.0",
    },
    capabilities: {},
    onAppCreated: (createdApp: App) => {
      createdApp.ontoolresult = (result) => {
        const sc = result.structuredContent as
          | (T & { type?: string })
          | undefined;

        if (sc && (sc as { type?: string }).type === expectedType) {
          setData(sc);
        } else {
          setData(null);
        }

        if (result.content) {
          setContent(
            result.content as Array<{ type: string; text?: string }>
          );
        }
      };

      createdApp.onhostcontextchanged = () => {
        const ctx = createdApp.getHostContext();
        const mode =
          ctx?.theme === "dark" ? "dark" : "light";
        applyTheme(mode);
      };
    },
  });

  // Connected if ext-apps handshake completed OR data arrived from dashboard
  const isConnected = extAppsConnected || dashboardConnected;

  // Listen for messages from parent dashboard:
  // - "mcp-app:tool-result": initial data delivery when iframe loads
  // - "update-structured-content": incremental updates from patch engine
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      // Dashboard sends tool-result on iframe load
      if (msg.type === "mcp-app:tool-result") {
        const sc = msg.structuredContent as (T & { type?: string }) | undefined;
        if (sc && sc.type === expectedType) {
          setData(sc);
          setDashboardConnected(true);
        }
        if (msg.content) {
          setContent(msg.content as Array<{ type: string; text?: string }>);
        }
        return;
      }

      // Dashboard patch engine sends incremental updates
      if (msg.type === "update-structured-content") {
        const incoming = msg.content as (T & { type?: string }) | undefined;
        if (!incoming) return;

        const action: string = msg.action ?? "replace";

        if (action === "replace") {
          setData(incoming);
        } else if (action === "merge") {
          setData((prev) => {
            if (!prev || typeof prev !== "object") return incoming;
            return { ...prev, ...incoming };
          });
        }
        setDashboardConnected(true);
        return;
      }
    }

    window.addEventListener("message", handleMessage);

    // Signal to parent (playground / dashboard) that our listener is ready.
    // Heavy views may finish mounting after the parent's onLoad has already
    // sent data, so the parent can re-send when it receives this signal.
    try {
      window.parent?.postMessage({ type: "mcp-app:view-ready" }, "*");
    } catch {
      // Silently ignore if cross-origin parent blocks postMessage
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [expectedType]);

  // Apply ?theme= query param on mount (one-time, before host context arrives)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const presetName = params.get("theme");
    if (presetName) {
      applyPreset(presetName);
    }
  }, []);

  useHostStyles(app, app?.getHostContext());
  const themeStr = useDocumentTheme();
  const theme: "light" | "dark" =
    themeStr === "dark" ? "dark" : "light";

  const callTool = useCallback(
    async (name: string, args: Record<string, unknown>) => {
      if (!app) return;
      try {
        setCallToolError(null);
        await app.callServerTool({ name, arguments: args });
      } catch (err) {
        setCallToolError(
          err instanceof Error ? err.message : "Tool call failed"
        );
      }
    },
    [app]
  );

  return {
    app,
    data,
    content,
    theme,
    isConnected,
    error: error?.toString() ?? callToolError,
    callTool,
  };
}
