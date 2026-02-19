import { useState, useCallback, useEffect } from "react";
import { useViewBus } from "../bus";
import type { ViewMessage } from "../bus";

type BusPayload = Omit<ViewMessage, "source">;

export interface ViewFilterState {
  filters: Record<string, unknown>;
  setFilter: (field: string, value: unknown) => void;
  clearFilter: (field: string) => void;
  clearAll: () => void;
}

interface UseViewFilterOptions {
  panelId?: string;
}

/**
 * Cross-View filtering hook.
 *
 * Wraps `useViewBus` to send and receive `filter` messages. Manages filters
 * as a `Record<string, unknown>`. Setting a filter updates local state AND
 * broadcasts to sibling Views. A `value` of `null` is the sentinel for
 * "clear this filter".
 */
export function useViewFilter(
  options: UseViewFilterOptions = {}
): ViewFilterState {
  const bus = useViewBus({ panelId: options.panelId });
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const setFilter = useCallback(
    (field: string, value: unknown) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
      bus.send({ type: "filter", field, value } as BusPayload);
    },
    [bus]
  );

  const clearFilter = useCallback(
    (field: string) => {
      setFilters((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      bus.send({ type: "filter", field, value: null } as BusPayload);
    },
    [bus]
  );

  const clearAll = useCallback(() => {
    setFilters((prev) => {
      const fields = Object.keys(prev);
      for (const field of fields) {
        bus.send({ type: "filter", field, value: null } as BusPayload);
      }
      return {};
    });
  }, [bus]);

  useEffect(() => {
    const unsub = bus.subscribe("filter", (msg) => {
      setFilters((prev) => {
        if (msg.value === null || msg.value === undefined) {
          const next = { ...prev };
          delete next[msg.field];
          return next;
        }
        return { ...prev, [msg.field]: msg.value };
      });
    });
    return unsub;
  }, [bus]);

  return { filters, setFilter, clearFilter, clearAll };
}
