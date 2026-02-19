import {
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { ViewBusEnvelope, ViewMessage } from "./types";

interface ViewBusProviderProps {
  children: ReactNode;
  filter?: (
    message: ViewMessage,
    sourcePanelId: string,
    targetPanelId: string
  ) => boolean;
}

interface ViewBusContextValue {
  registerChild: (panelId: string, iframe: HTMLIFrameElement) => void;
  unregisterChild: (panelId: string) => void;
}

const ViewBusContext = createContext<ViewBusContextValue | null>(null);

export function useViewBusContainer(): ViewBusContextValue {
  const ctx = useContext(ViewBusContext);
  if (!ctx) {
    throw new Error(
      "useViewBusContainer must be used within a ViewBusProvider"
    );
  }
  return ctx;
}

function isViewBusEnvelope(data: unknown): data is ViewBusEnvelope {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as Record<string, unknown>).__chuk_bus === true
  );
}

function isLegacyMessage(
  data: unknown
): data is Record<string, unknown> & { __chuk_panel_id: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as Record<string, unknown>).__chuk_panel_id === "string" &&
    !(data as Record<string, unknown>).__chuk_bus
  );
}

export function ViewBusProvider({ children, filter }: ViewBusProviderProps) {
  const childrenRef = useRef<Map<string, HTMLIFrameElement>>(new Map());
  const filterRef = useRef(filter);
  filterRef.current = filter;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      // Handle typed bus messages
      if (isViewBusEnvelope(data)) {
        const sourcePanelId = data.message.source;

        for (const [panelId, iframe] of childrenRef.current.entries()) {
          if (panelId === sourcePanelId) continue;
          if (!iframe.contentWindow) continue;

          if (
            filterRef.current &&
            !filterRef.current(data.message, sourcePanelId, panelId)
          ) {
            continue;
          }

          const relayedEnvelope: ViewBusEnvelope = {
            ...data,
            __chuk_source_panel: sourcePanelId,
          };
          iframe.contentWindow.postMessage(relayedEnvelope, "*");
        }
        return;
      }

      // Backwards compatibility: relay legacy __chuk_panel_id messages
      if (isLegacyMessage(data)) {
        const sourcePanelId = data.__chuk_panel_id;
        for (const [panelId, iframe] of childrenRef.current.entries()) {
          if (panelId === sourcePanelId) continue;
          if (!iframe.contentWindow) continue;
          iframe.contentWindow.postMessage(
            { ...data, __chuk_source_panel: sourcePanelId },
            "*"
          );
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const registerChild = useCallback(
    (panelId: string, iframe: HTMLIFrameElement) => {
      childrenRef.current.set(panelId, iframe);
    },
    []
  );

  const unregisterChild = useCallback((panelId: string) => {
    childrenRef.current.delete(panelId);
  }, []);

  return (
    <ViewBusContext.Provider value={{ registerChild, unregisterChild }}>
      {children}
    </ViewBusContext.Provider>
  );
}
