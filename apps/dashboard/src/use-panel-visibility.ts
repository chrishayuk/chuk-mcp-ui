import { useState, useEffect, useCallback } from "react";
import type { PanelV2 } from "./schema";

interface PanelVisibility {
  isPanelVisible: (panel: PanelV2) => boolean;
  isCollapsed: (panelId: string) => boolean;
  toggleCollapsed: (panelId: string) => void;
}

/**
 * Track panel visibility based on showWhen conditions and collapsed state.
 *
 * Listens for ViewBus select messages to track which panels have active
 * selections, then evaluates showWhen.linkedPanelHasSelection conditions.
 */
export function usePanelVisibility(panels: PanelV2[]): PanelVisibility {
  const [panelSelections, setPanelSelections] = useState<Map<string, boolean>>(
    () => new Map(),
  );
  const [manuallyExpanded, setManuallyExpanded] = useState<Set<string>>(
    () => new Set(),
  );

  // Listen for selection messages from child iframes
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      // ViewBus envelope with select message
      if (data.__chuk_bus && data.message?.type === "select") {
        const sourcePanel = data.message.source;
        const hasSelection =
          Array.isArray(data.message.ids) && data.message.ids.length > 0;
        setPanelSelections((prev) => {
          const next = new Map(prev);
          next.set(sourcePanel, hasSelection);
          return next;
        });
        return;
      }

      // Legacy __chuk_panel_id messages with select-like events
      if (
        data.__chuk_panel_id &&
        (data.__chuk_event === "row-click" || data.__chuk_event === "feature-click")
      ) {
        setPanelSelections((prev) => {
          const next = new Map(prev);
          next.set(data.__chuk_panel_id, true);
          return next;
        });
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const toggleCollapsed = useCallback((panelId: string) => {
    setManuallyExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(panelId)) {
        next.delete(panelId);
      } else {
        next.add(panelId);
      }
      return next;
    });
  }, []);

  const isCollapsed = useCallback(
    (panelId: string) => {
      const panel = panels.find((p) => p.id === panelId);
      if (!panel?.collapsed) return false;
      return !manuallyExpanded.has(panelId);
    },
    [panels, manuallyExpanded],
  );

  const isPanelVisible = useCallback(
    (panel: PanelV2): boolean => {
      // Collapsed panels hidden unless manually expanded
      if (panel.collapsed && !manuallyExpanded.has(panel.id)) {
        return false;
      }
      // showWhen condition
      if (panel.showWhen?.linkedPanelHasSelection) {
        const linkedId = panel.showWhen.linkedPanelHasSelection;
        return panelSelections.get(linkedId) ?? false;
      }
      return true;
    },
    [panelSelections, manuallyExpanded],
  );

  return { isPanelVisible, isCollapsed, toggleCollapsed };
}
