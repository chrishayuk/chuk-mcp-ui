import { useState, useEffect, useCallback } from "react";
import {
  useApp,
  useHostStyles,
  useDocumentTheme,
} from "@modelcontextprotocol/ext-apps/react";
import type { App } from "@modelcontextprotocol/ext-apps";
import { applyTheme } from "./theme";

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
  const [data, setData] = useState<T | null>(null);
  const [content, setContent] = useState<Array<{
    type: string;
    text?: string;
  }> | null>(null);
  const [callToolError, setCallToolError] = useState<string | null>(null);
  // Track whether data arrived via dashboard postMessage (bypasses ext-apps)
  const [dashboardConnected, setDashboardConnected] = useState(false);

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
    return () => window.removeEventListener("message", handleMessage);
  }, [expectedType]);

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
