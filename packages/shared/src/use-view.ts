import { useState, useCallback } from "react";
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
 */
export function useView<T>(
  expectedType: string,
  _expectedVersion: string
): ViewState<T> {
  const [data, setData] = useState<T | null>(null);
  const [content, setContent] = useState<Array<{
    type: string;
    text?: string;
  }> | null>(null);
  const [callToolError, setCallToolError] = useState<string | null>(null);

  const { app, isConnected, error } = useApp({
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
