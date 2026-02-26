/**
 * Server-side cross-view state propagation for compose engine.
 *
 * Takes initial selection/filter state and CrossViewLink declarations,
 * then propagates state through links so panels can be pre-rendered
 * with their initial cross-view state.
 */
import type { CrossViewLink } from "@apps/dashboard/src/schema";
import type { ComposeSection } from "./compose";

// ── Public types ────────────────────────────────────────────────────

export interface ComposeInitialState {
  /** Per-panel initial selections: panelId → selected IDs */
  selections?: Record<string, string[]>;
  /** Per-panel initial filters: panelId → { field: value } */
  filters?: Record<string, Record<string, unknown>>;
  /** Per-panel initial highlight: panelId → highlighted ID */
  highlights?: Record<string, string>;
}

export interface PanelOverlay {
  selectedIds?: string[];
  filters?: Record<string, unknown>;
  highlightedId?: string;
}

// ── Link type → propagation behaviour ───────────────────────────────

const PROPAGATION_MAP: Record<string, "selection" | "filter" | "highlight"> = {
  selection: "selection",
  filter: "filter",
  highlight: "highlight",
};

// ── Propagation engine ──────────────────────────────────────────────

/**
 * Compute per-panel overlays by propagating initial state through links.
 *
 * Returns a Map where each key is a panel ID and each value is the
 * combined overlay (explicit + propagated) for that panel.
 */
export function propagateState(
  sections: ComposeSection[],
  links: CrossViewLink[] | undefined,
  initialState: ComposeInitialState | undefined,
): Map<string, PanelOverlay> {
  const overlays = new Map<string, PanelOverlay>();
  const panelIds = new Set(sections.map((s) => s.id));

  if (!initialState) return overlays;

  // 1. Seed with explicit state
  for (const panelId of panelIds) {
    const overlay: PanelOverlay = {};
    let hasData = false;

    if (initialState.selections?.[panelId]) {
      overlay.selectedIds = initialState.selections[panelId];
      hasData = true;
    }
    if (initialState.filters?.[panelId]) {
      overlay.filters = { ...initialState.filters[panelId] };
      hasData = true;
    }
    if (initialState.highlights?.[panelId]) {
      overlay.highlightedId = initialState.highlights[panelId];
      hasData = true;
    }

    if (hasData) {
      overlays.set(panelId, overlay);
    }
  }

  // 2. Propagate through links
  if (!links || links.length === 0) return overlays;

  for (const link of links) {
    propagateLink(link, overlays, panelIds);
    if (link.bidirectional) {
      propagateLink(reverseLink(link), overlays, panelIds);
    }
  }

  return overlays;
}

function propagateLink(
  link: CrossViewLink,
  overlays: Map<string, PanelOverlay>,
  panelIds: Set<string>,
): void {
  const { source, target, type } = link;

  // Both panels must exist
  if (!panelIds.has(source) || !panelIds.has(target)) return;

  const sourceOverlay = overlays.get(source);
  if (!sourceOverlay) return;

  const behaviour = PROPAGATION_MAP[type];
  if (!behaviour) return;

  const targetOverlay = overlays.get(target) ?? {};

  if (behaviour === "selection" && sourceOverlay.selectedIds) {
    // Propagate selection IDs to target
    targetOverlay.selectedIds = [
      ...(targetOverlay.selectedIds ?? []),
      ...sourceOverlay.selectedIds,
    ];
  }

  if (behaviour === "filter" && sourceOverlay.filters) {
    // Propagate filter values, mapped by sourceField → targetField
    targetOverlay.filters = {
      ...(targetOverlay.filters ?? {}),
    };
    const sourceVal = sourceOverlay.filters[link.sourceField];
    if (sourceVal !== undefined) {
      targetOverlay.filters[link.targetField] = sourceVal;
    }
  }

  if (behaviour === "highlight" && sourceOverlay.highlightedId) {
    targetOverlay.highlightedId = sourceOverlay.highlightedId;
  }

  overlays.set(target, targetOverlay);
}

function reverseLink(link: CrossViewLink): CrossViewLink {
  return {
    ...link,
    source: link.target,
    target: link.source,
    sourceField: link.targetField,
    targetField: link.sourceField,
    bidirectional: false,
  };
}
