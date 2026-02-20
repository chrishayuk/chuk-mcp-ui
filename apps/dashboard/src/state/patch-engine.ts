import type {
  UIPatch,
  PatchOp,
  PanelV2,
  CrossViewLink,
  LayoutConfig,
} from "../schema";
import type { UIState, PanelState } from "./ui-state-store";
import { panelV2ToPanelState } from "./ui-state-store";
import { computeFingerprint, computeDataSummary } from "./state-emitter";

// ── Public API ───────────────────────────────────────────────────

/**
 * Apply a UIPatch to UIState. Returns a new state object.
 * Ops are applied sequentially in order.
 * Throws on invalid ops (unknown panelId for update, etc.).
 */
export function applyPatch(state: UIState, patch: UIPatch): UIState {
  let current = state;
  for (const op of patch.ops) {
    current = applyOp(current, op);
  }
  return current;
}

/**
 * Apply a single PatchOp. Returns new state.
 */
export function applyOp(state: UIState, op: PatchOp): UIState {
  switch (op.op) {
    case "add-panel":
      return addPanel(state, op.panel, op.after);

    case "remove-panel":
      return removePanel(state, op.panelId);

    case "update-panel":
      return updatePanel(state, op.panelId, op.action, op.data, op.targetField);

    case "show-panel":
      return setPanelField(state, op.panelId, { visible: op.visible });

    case "collapse-panel":
      return setPanelField(state, op.panelId, { collapsed: op.collapsed });

    case "add-link":
      return addLink(state, op.link);

    case "remove-link":
      return removeLink(state, op.source, op.target);

    case "update-layout":
      return updateLayout(state, op.layout);

    case "set-loading":
      return setPanelField(state, op.panelId, { loading: op.loading });

    case "set-error":
      return setPanelField(state, op.panelId, { error: op.error });
  }
}

// ── Op implementations ───────────────────────────────────────────

function addPanel(
  state: UIState,
  panelDef: PanelV2,
  after?: string,
): UIState {
  const newPanel = panelV2ToPanelState(panelDef);
  // Default new panels to visible
  newPanel.visible = true;
  const panels = [...state.panels];

  if (after) {
    const idx = panels.findIndex((p) => p.id === after);
    if (idx >= 0) {
      panels.splice(idx + 1, 0, newPanel);
    } else {
      panels.push(newPanel);
    }
  } else {
    panels.push(newPanel);
  }

  return { ...state, panels };
}

function removePanel(state: UIState, panelId: string): UIState {
  return {
    ...state,
    panels: state.panels.filter((p) => p.id !== panelId),
    // Also remove links referencing this panel
    links: state.links.filter(
      (l) => l.source !== panelId && l.target !== panelId,
    ),
  };
}

function updatePanel(
  state: UIState,
  panelId: string,
  action: "replace" | "merge" | "append",
  data: Record<string, unknown>,
  targetField?: string,
): UIState {
  return mapPanel(state, panelId, (panel) => {
    let content = panel.structuredContent;

    if (action === "replace") {
      if (targetField) {
        content = {
          ...(content as Record<string, unknown>),
          [targetField]: data[targetField] ?? data,
        };
      } else {
        content = data;
      }
    } else if (action === "merge") {
      content = { ...(content as Record<string, unknown>), ...data };
    } else if (action === "append") {
      if (targetField) {
        const existing = (content as Record<string, unknown>)[targetField];
        const arr = Array.isArray(existing) ? existing : [];
        const toAppend = data[targetField] ?? data;
        content = {
          ...(content as Record<string, unknown>),
          [targetField]: [...arr, ...(Array.isArray(toAppend) ? toAppend : [toAppend])],
        };
      } else {
        // Append at top level — merge arrays if both are arrays
        content = { ...(content as Record<string, unknown>), ...data };
      }
    }

    return {
      ...panel,
      structuredContent: content,
      dataFingerprint: computeFingerprint(content),
      dataSummary: computeDataSummary(content),
    };
  });
}

function setPanelField(
  state: UIState,
  panelId: string,
  fields: Partial<PanelState>,
): UIState {
  return mapPanel(state, panelId, (panel) => ({ ...panel, ...fields }));
}

function addLink(state: UIState, link: CrossViewLink): UIState {
  return { ...state, links: [...state.links, link] };
}

function removeLink(
  state: UIState,
  source: string,
  target: string,
): UIState {
  return {
    ...state,
    links: state.links.filter(
      (l) => !(l.source === source && l.target === target),
    ),
  };
}

function updateLayout(state: UIState, layout: LayoutConfig): UIState {
  return { ...state, layout };
}

// ── Helpers ──────────────────────────────────────────────────────

function mapPanel(
  state: UIState,
  panelId: string,
  updater: (panel: PanelState) => PanelState,
): UIState {
  return {
    ...state,
    panels: state.panels.map((p) => (p.id === panelId ? updater(p) : p)),
  };
}

/**
 * Returns the set of panel ids whose structuredContent changed between
 * old and new state. Useful for selective re-rendering.
 */
export function changedPanelIds(
  oldState: UIState,
  newState: UIState,
): Set<string> {
  const changed = new Set<string>();
  const oldMap = new Map(oldState.panels.map((p) => [p.id, p]));

  for (const panel of newState.panels) {
    const old = oldMap.get(panel.id);
    if (!old || old.dataFingerprint !== panel.dataFingerprint) {
      changed.add(panel.id);
    }
  }

  // Removed panels
  for (const panel of oldState.panels) {
    if (!newState.panels.some((p) => p.id === panel.id)) {
      changed.add(panel.id);
    }
  }

  return changed;
}
