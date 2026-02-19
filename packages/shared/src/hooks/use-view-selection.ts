import { useState, useCallback, useEffect } from "react";
import { useViewBus } from "../bus";
import type { ViewMessage } from "../bus";

type BusPayload = Omit<ViewMessage, "source">;

export interface ViewSelectionState {
  selectedIds: string[];
  highlightedId: string | null;
  select: (ids: string[]) => void;
  highlight: (id: string | null) => void;
  clearSelection: () => void;
}

interface UseViewSelectionOptions {
  panelId?: string;
}

/**
 * Shared selection state across composed Views.
 *
 * Wraps `useViewBus` to send and receive `select` and `highlight` messages.
 * Calling `select()` / `highlight()` updates local state AND broadcasts to
 * sibling Views via the bus. Incoming messages from siblings update local state.
 */
export function useViewSelection(
  options: UseViewSelectionOptions = {}
): ViewSelectionState {
  const bus = useViewBus({ panelId: options.panelId });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const select = useCallback(
    (ids: string[]) => {
      setSelectedIds(ids);
      bus.send({ type: "select", ids } as BusPayload);
    },
    [bus]
  );

  const highlight = useCallback(
    (id: string | null) => {
      setHighlightedId(id);
      if (id !== null) {
        bus.send({ type: "highlight", id } as BusPayload);
      }
    },
    [bus]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setHighlightedId(null);
    bus.send({ type: "select", ids: [] } as BusPayload);
  }, [bus]);

  useEffect(() => {
    const unsub1 = bus.subscribe("select", (msg) => {
      setSelectedIds(msg.ids);
    });
    const unsub2 = bus.subscribe("highlight", (msg) => {
      setHighlightedId(msg.id);
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, [bus]);

  return { selectedIds, highlightedId, select, highlight, clearSelection };
}
