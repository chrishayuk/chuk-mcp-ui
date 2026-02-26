/**
 * In-memory pub/sub bus for composed (non-iframe) pages.
 *
 * Replaces iframe postMessage relay for SSR-composed pages where all
 * panels share the same window. Uses the same ViewMessage types and
 * link filtering as the iframe-based ViewBusProvider.
 */
import type {
  ViewMessage,
  ViewMessageType,
  ViewBusHandler,
  ViewBusUnsubscribe,
} from "./types";

/** Filter function matching the ViewBusProvider signature */
type LinkFilter = (
  message: ViewMessage,
  sourcePanelId: string,
  targetPanelId: string,
) => boolean;

export interface ComposeBus {
  /** Send a message from a panel to all linked panels */
  send(panelId: string, message: Omit<ViewMessage, "source">): void;
  /** Subscribe to a specific message type for a specific panel */
  subscribe<T extends ViewMessageType>(
    panelId: string,
    type: T,
    handler: ViewBusHandler<T>,
  ): ViewBusUnsubscribe;
  /** Subscribe to all messages for a specific panel */
  subscribeAll(
    panelId: string,
    handler: (message: ViewMessage, sourcePanelId?: string) => void,
  ): ViewBusUnsubscribe;
  /** Register a panel ID */
  registerPanel(panelId: string): void;
  /** Tear down and clear all handlers */
  destroy(): void;
}

/**
 * Create an in-memory compose bus with optional link-based filtering.
 *
 * @param filter Optional link filter (build with buildLinkFilter from dashboard)
 */
export function createComposeBus(filter?: LinkFilter): ComposeBus {
  const panels = new Set<string>();

  // Per-panel, per-type handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedHandlers = new Map<string, Map<string, Set<ViewBusHandler<any>>>>();
  // Per-panel catch-all handlers
  const allHandlers = new Map<
    string,
    Set<(message: ViewMessage, sourcePanelId?: string) => void>
  >();

  function ensurePanel(panelId: string) {
    if (!typedHandlers.has(panelId)) {
      typedHandlers.set(panelId, new Map());
    }
    if (!allHandlers.has(panelId)) {
      allHandlers.set(panelId, new Set());
    }
  }

  return {
    send(panelId: string, messageWithoutSource: Omit<ViewMessage, "source">) {
      panels.add(panelId);
      const message = { ...messageWithoutSource, source: panelId } as ViewMessage;

      // Deliver to all other registered panels
      for (const targetId of panels) {
        if (targetId === panelId) continue;

        // Apply link filter
        if (filter && !filter(message, panelId, targetId)) continue;

        // Dispatch via microtask to avoid sync re-render cascades
        queueMicrotask(() => {
          // Typed handlers
          const panelTyped = typedHandlers.get(targetId);
          if (panelTyped) {
            const typeSet = panelTyped.get(message.type);
            if (typeSet) {
              for (const h of typeSet) h(message, panelId);
            }
          }

          // All-handlers
          const panelAll = allHandlers.get(targetId);
          if (panelAll) {
            for (const h of panelAll) h(message, panelId);
          }
        });
      }
    },

    subscribe<T extends ViewMessageType>(
      panelId: string,
      type: T,
      handler: ViewBusHandler<T>,
    ): ViewBusUnsubscribe {
      ensurePanel(panelId);
      const panelTyped = typedHandlers.get(panelId)!;
      if (!panelTyped.has(type)) {
        panelTyped.set(type, new Set());
      }
      panelTyped.get(type)!.add(handler);

      return () => {
        panelTyped.get(type)?.delete(handler);
      };
    },

    subscribeAll(
      panelId: string,
      handler: (message: ViewMessage, sourcePanelId?: string) => void,
    ): ViewBusUnsubscribe {
      ensurePanel(panelId);
      allHandlers.get(panelId)!.add(handler);

      return () => {
        allHandlers.get(panelId)?.delete(handler);
      };
    },

    registerPanel(panelId: string) {
      panels.add(panelId);
      ensurePanel(panelId);
    },

    destroy() {
      panels.clear();
      typedHandlers.clear();
      allHandlers.clear();
    },
  };
}
