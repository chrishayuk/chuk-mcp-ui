import { useEffect, useCallback, useRef, useMemo } from "react";
import type {
  ViewMessage,
  ViewMessageType,
  ViewBusHandler,
  ViewBusUnsubscribe,
  ViewBusEnvelope,
} from "./types";
import { BUS_VERSION } from "./constants";
import { useComposeBus } from "./ComposeBusProvider";

interface UseViewBusOptions {
  panelId?: string;
}

interface ViewBus {
  send: (message: Omit<ViewMessage, "source">) => void;
  subscribe: <T extends ViewMessageType>(
    type: T,
    handler: ViewBusHandler<T>
  ) => ViewBusUnsubscribe;
  subscribeAll: (
    handler: (message: ViewMessage, sourcePanelId?: string) => void
  ) => ViewBusUnsubscribe;
  panelId: string | null;
}

function isViewBusEnvelope(data: unknown): data is ViewBusEnvelope {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as Record<string, unknown>).__chuk_bus === true
  );
}

export function useViewBus(options: UseViewBusOptions = {}): ViewBus {
  // ── Compose mode detection ──────────────────────────────────────
  // Always call useComposeBus (hooks must be called unconditionally).
  // Returns null when not inside a ComposeBusProvider.
  const composeBusCtx = useComposeBus();

  // ── PostMessage-based implementation (iframe mode) ──────────────
  const panelIdRef = useRef<string | null>(options.panelId ?? null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlersRef = useRef<Map<string, Set<ViewBusHandler<any>>>>(new Map());
  const allHandlersRef = useRef<
    Set<(message: ViewMessage, sourcePanelId?: string) => void>
  >(new Set());

  useEffect(() => {
    // Skip postMessage listener in compose mode
    if (composeBusCtx) return;

    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      // Auto-detect panel ID from legacy container messages
      if (
        typeof data.__chuk_panel_id === "string" &&
        !panelIdRef.current
      ) {
        panelIdRef.current = data.__chuk_panel_id;
      }

      // Process typed bus messages
      if (isViewBusEnvelope(data)) {
        const { message, __chuk_source_panel } = data;

        const typeHandlers = handlersRef.current.get(message.type);
        if (typeHandlers) {
          for (const handler of typeHandlers) {
            handler(message, __chuk_source_panel);
          }
        }

        for (const handler of allHandlersRef.current) {
          handler(message, __chuk_source_panel);
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [composeBusCtx]);

  const postMessageSend = useCallback(
    (messageWithoutSource: Omit<ViewMessage, "source">) => {
      const source = panelIdRef.current ?? "unknown";
      const message = { ...messageWithoutSource, source } as ViewMessage;

      const envelope: ViewBusEnvelope = {
        __chuk_bus: true,
        __chuk_bus_version: BUS_VERSION,
        message,
      };

      window.parent.postMessage(envelope, "*");
    },
    []
  );

  const postMessageSubscribe = useCallback(
    <T extends ViewMessageType>(
      type: T,
      handler: ViewBusHandler<T>
    ): ViewBusUnsubscribe => {
      if (!handlersRef.current.has(type)) {
        handlersRef.current.set(type, new Set());
      }
      handlersRef.current.get(type)!.add(handler);

      return () => {
        handlersRef.current.get(type)?.delete(handler);
      };
    },
    []
  );

  const postMessageSubscribeAll = useCallback(
    (
      handler: (message: ViewMessage, sourcePanelId?: string) => void
    ): ViewBusUnsubscribe => {
      allHandlersRef.current.add(handler);
      return () => {
        allHandlersRef.current.delete(handler);
      };
    },
    []
  );

  // ── Compose-mode adapter ────────────────────────────────────────
  const composeSend = useCallback(
    (message: Omit<ViewMessage, "source">) => {
      if (composeBusCtx) {
        composeBusCtx.bus.send(composeBusCtx.panelId, message);
      }
    },
    [composeBusCtx]
  );

  const composeSubscribe = useCallback(
    <T extends ViewMessageType>(
      type: T,
      handler: ViewBusHandler<T>
    ): ViewBusUnsubscribe => {
      if (composeBusCtx) {
        return composeBusCtx.bus.subscribe(composeBusCtx.panelId, type, handler);
      }
      return () => {};
    },
    [composeBusCtx]
  );

  const composeSubscribeAll = useCallback(
    (
      handler: (message: ViewMessage, sourcePanelId?: string) => void
    ): ViewBusUnsubscribe => {
      if (composeBusCtx) {
        return composeBusCtx.bus.subscribeAll(composeBusCtx.panelId, handler);
      }
      return () => {};
    },
    [composeBusCtx]
  );

  // ── Return the right implementation ─────────────────────────────
  return useMemo(() => {
    if (composeBusCtx) {
      return {
        send: composeSend,
        subscribe: composeSubscribe,
        subscribeAll: composeSubscribeAll,
        panelId: composeBusCtx.panelId,
      };
    }
    return {
      send: postMessageSend,
      subscribe: postMessageSubscribe,
      subscribeAll: postMessageSubscribeAll,
      panelId: panelIdRef.current,
    };
  }, [
    composeBusCtx,
    composeSend, composeSubscribe, composeSubscribeAll,
    postMessageSend, postMessageSubscribe, postMessageSubscribeAll,
  ]);
}
