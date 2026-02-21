import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import {
  useApp,
  useHostStyles,
  useDocumentTheme,
} from "@modelcontextprotocol/ext-apps/react";
import type { App } from "@modelcontextprotocol/ext-apps";
import { applyTheme } from "@chuk/view-shared";
import type { DashboardContent, DashboardContentV2, UIPatch } from "./schema";
import {
  UIStateStore,
  EventQueue,
  classifyMessage,
  createRateLimitedEmitter,
  serialiseUIState,
  applyPatch,
  applyOp,
  changedPanelIds,
} from "./state";
import type { UIState } from "./state";

// ── Return type ──────────────────────────────────────────────────

export interface DashboardRuntime {
  /** Initial dashboard data (v1.0 or v2.0). Null until first tool result. */
  data: DashboardContent | null;
  /** Current runtime state (v3.0). Null for v1.0 dashboards. */
  uiState: UIState | null;
  /** Set of panel IDs whose content changed in the last patch. */
  changedPanels: Set<string>;
  /** Raw content blocks from tool results. */
  content: Array<{ type: string; text?: string }> | null;
  /** Whether the app is connected to the host. */
  isConnected: boolean;
  /** Theme from host context. */
  theme: "light" | "dark";
  /** Connection or tool error. */
  error: string | null;
  /** The App instance for direct access. */
  app: App | null;
}

// ── Hook ─────────────────────────────────────────────────────────

export function useDashboardRuntime(): DashboardRuntime {
  const [data, setData] = useState<DashboardContent | null>(null);
  const [content, setContent] = useState<Array<{
    type: string;
    text?: string;
  }> | null>(null);
  const [changedPanels, setChangedPanels] = useState<Set<string>>(
    () => new Set(),
  );
  // Track whether data arrived via postMessage (bypasses ext-apps)
  const [postMessageConnected, setPostMessageConnected] = useState(false);

  // Store ref — initialized when first v2.0 dashboard arrives
  const storeRef = useRef<UIStateStore | null>(null);
  const eventQueueRef = useRef<EventQueue | null>(null);
  const emitterRef = useRef<ReturnType<typeof createRateLimitedEmitter> | null>(
    null,
  );
  const appRef = useRef<App | null>(null);

  // Process incoming structured content (shared by ext-apps and postMessage paths)
  const handleStructuredContent = (
    sc: Record<string, unknown>,
    sourceApp?: App,
  ) => {
    // v1.0 or v2.0 dashboard — initial render
    if (sc.type === "dashboard") {
      setData(sc as unknown as DashboardContent);

      // Initialize runtime for v2.0
      if (sc.version === "2.0") {
        const store = UIStateStore.fromDashboard(
          sc as unknown as DashboardContentV2,
        );
        storeRef.current = store;

        // Set up event queue
        const queue = new EventQueue();
        eventQueueRef.current = queue;

        if (sourceApp) {
          // Set up rate-limited emitter
          const emitter = createRateLimitedEmitter(sourceApp);
          emitterRef.current = emitter;

          // Emit on every queued event
          queue.onEvent(() => {
            const events = queue.drain();
            emitter.emit(store.getState(), events);
          });

          // Push initial state
          emitter.emit(store.getState(), []);
        }
      }
      return;
    }

    // v3.0 patch — apply to existing store
    if (sc.type === "ui_patch" && sc.version === "3.0") {
      const store = storeRef.current;
      if (!store) return;

      const oldState = store.getState();
      const newState = applyPatch(oldState, sc as unknown as UIPatch);
      store.setState(() => newState);

      // Track which panels changed
      setChangedPanels(changedPanelIds(oldState, newState));

      // Push updated state
      emitterRef.current?.emit(newState, []);
      return;
    }
  };

  const { app, isConnected: extAppsConnected, error } = useApp({
    appInfo: {
      name: "@chuk/view-dashboard",
      version: "1.0.0",
    },
    capabilities: {
      tools: {},
    },
    onAppCreated: (createdApp: App) => {
      createdApp.ontoolresult = (result) => {
        const sc = result.structuredContent as Record<string, unknown> | undefined;

        if (result.content) {
          setContent(
            result.content as Array<{ type: string; text?: string }>,
          );
        }

        if (sc) {
          handleStructuredContent(sc, createdApp);
        }
      };

      createdApp.ontoolinputpartial = (params) => {
        // Attempt to parse partial arguments as a ui_patch
        try {
          const args = params.arguments as Record<string, unknown> | undefined;
          if (!args) return;
          const sc = args.structuredContent as Record<string, unknown> | undefined;
          if (!sc || sc.type !== "ui_patch" || sc.version !== "3.0") return;

          const ops = sc.ops;
          if (!Array.isArray(ops) || ops.length === 0) return;

          const store = storeRef.current;
          if (!store) return;

          // Only apply add-panel and set-loading ops from partial results
          // (these are safe to apply progressively)
          const safeOps = ops.filter(
            (op: Record<string, unknown>) =>
              op.op === "add-panel" || op.op === "set-loading"
          );
          if (safeOps.length === 0) return;

          const oldState = store.getState();
          let current = oldState;
          for (const op of safeOps) {
            try {
              current = applyOp(current, op as any);
            } catch {
              // Skip invalid partial ops
            }
          }
          if (current !== oldState) {
            store.setState(() => current);
          }
        } catch {
          // Partial arguments may be incomplete JSON — ignore errors
        }
      };

      createdApp.onhostcontextchanged = () => {
        const ctx = createdApp.getHostContext();
        const mode = ctx?.theme === "dark" ? "dark" : "light";
        applyTheme(mode);
      };
    },
  });

  // Connected if ext-apps handshake completed OR data arrived via postMessage
  const isConnected = extAppsConnected || postMessageConnected;

  // Listen for host postMessage delivery (fallback when ext-apps is unavailable)
  useEffect(() => {
    function handleHostMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      // Host delivers tool result via postMessage
      if (msg.type === "mcp-app:tool-result") {
        const sc = msg.structuredContent as Record<string, unknown> | undefined;
        if (msg.content) {
          setContent(msg.content as Array<{ type: string; text?: string }>);
        }
        if (sc) {
          handleStructuredContent(sc);
          setPostMessageConnected(true);
        }
        return;
      }
    }

    window.addEventListener("message", handleHostMessage);
    return () => window.removeEventListener("message", handleHostMessage);
  }, []);

  // Register get_ui_state tool handler
  useEffect(() => {
    if (!app) return;
    appRef.current = app;

    app.onlisttools = async () => ({
      tools: ["get_ui_state"],
    });

    app.oncalltool = async (params) => {
      if (params.name === "get_ui_state") {
        const store = storeRef.current;
        const stateJson = store
          ? serialiseUIState(store.getState())
          : "{}";
        return {
          content: [{ type: "text", text: stateJson }],
        };
      }
      throw new Error(`Unknown tool: ${params.name}`);
    };
  }, [app]);

  // Listen for iframe interaction events
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const queue = eventQueueRef.current;
      if (!queue) return;

      const classified = classifyMessage(event.data);
      if (classified) {
        queue.push(classified);

        // High-priority events trigger an immediate LLM response
        if (
          appRef.current &&
          (classified.eventType === "draw" ||
            classified.eventType === "submit")
        ) {
          const description =
            classified.eventType === "draw"
              ? `User drew on panel "${classified.panelId}": ${JSON.stringify(classified.payload)}`
              : `User submitted form in panel "${classified.panelId}": ${JSON.stringify(classified.payload)}`;
          appRef.current
            .sendMessage({
              role: "user",
              content: [{ type: "text", text: description }],
            })
            .catch(() => {
              // Host may not support sendMessage
            });
        }

        // Update store selection state
        const store = storeRef.current;
        if (store && classified.eventType === "select") {
          store.setState((prev) => ({
            ...prev,
            panels: prev.panels.map((p) =>
              p.id === classified.panelId
                ? {
                    ...p,
                    selection: {
                      field:
                        (classified.payload.field as string) ?? "id",
                      values: (classified.payload.ids as unknown[]) ?? [],
                    },
                  }
                : p,
            ),
          }));
        }

        if (store && classified.eventType === "deselect") {
          store.setState((prev) => ({
            ...prev,
            panels: prev.panels.map((p) =>
              p.id === classified.panelId
                ? { ...p, selection: null }
                : p,
            ),
          }));
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Cleanup emitter and queue on unmount
  useEffect(() => {
    return () => {
      emitterRef.current?.dispose();
      eventQueueRef.current?.dispose();
    };
  }, []);

  // Subscribe to store changes for re-render
  const uiState = useSyncExternalStore(
    (cb) => {
      const store = storeRef.current;
      return store ? store.subscribe(cb) : () => {};
    },
    () => storeRef.current?.getState() ?? null,
  );

  useHostStyles(app, app?.getHostContext());
  const themeStr = useDocumentTheme();
  const theme: "light" | "dark" = themeStr === "dark" ? "dark" : "light";

  return {
    data,
    uiState,
    changedPanels,
    content,
    isConnected,
    theme,
    error: error?.toString() ?? null,
    app,
  };
}
