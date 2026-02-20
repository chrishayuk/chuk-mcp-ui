import type { PanelV2, LayoutConfig } from "./schema";
import { resolveNamedLayout } from "./layout-presets";

export interface ResolvedLayout {
  display: "flex" | "grid";
  direction?: "row" | "column";
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  panelStyles: Map<string, React.CSSProperties>;
}

const HERO_TYPES = new Set(["map", "layers", "minimap", "image", "compare"]);
const COMPACT_TYPES = new Set(["counter", "gauge", "status", "progress"]);

/**
 * Infer layout from panel types and count when layout is "auto".
 */
export function computeAutoLayout(panels: PanelV2[]): ResolvedLayout {
  if (panels.length === 0) {
    return { display: "flex", direction: "row", panelStyles: new Map() };
  }

  const sorted = [...panels].sort(
    (a, b) => (a.priority ?? 50) - (b.priority ?? 50),
  );

  const heroes = sorted.filter((p) => HERO_TYPES.has(p.viewType ?? ""));
  const compacts = sorted.filter((p) => COMPACT_TYPES.has(p.viewType ?? ""));
  const allCompact = compacts.length === sorted.length;

  // 1 panel → full width
  if (sorted.length === 1) {
    return { display: "flex", direction: "row", panelStyles: new Map() };
  }

  // All compact → KPI strip
  if (allCompact) {
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${Math.min(sorted.length, 4)}, 1fr)`,
      panelStyles: new Map(),
    };
  }

  // 2 same viewType → compare
  if (sorted.length === 2 && sorted[0].viewType === sorted[1].viewType) {
    return {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      panelStyles: new Map(),
    };
  }

  // 2 panels → split (hero gets 60%)
  if (sorted.length === 2) {
    return {
      display: "grid",
      gridTemplateColumns: heroes.length > 0 ? "3fr 2fr" : "1fr 1fr",
      panelStyles: new Map(),
    };
  }

  // Counters + other panels → KPI strip on top
  if (compacts.length >= 2 && compacts.length < sorted.length) {
    const others = sorted.filter((p) => !COMPACT_TYPES.has(p.viewType ?? ""));
    const kpiCount = Math.min(compacts.length, 4);
    const styles = new Map<string, React.CSSProperties>();

    for (const c of compacts) {
      styles.set(c.id, { gridRow: 1 });
    }
    for (const o of others) {
      styles.set(o.id, { gridRow: 2, gridColumn: `span ${Math.ceil(kpiCount / others.length)}` });
    }

    return {
      display: "grid",
      gridTemplateColumns: `repeat(${kpiCount}, 1fr)`,
      gridTemplateRows: "auto 1fr",
      panelStyles: styles,
    };
  }

  // Hero + 2 others → hero left, stacked right
  if (heroes.length === 1 && sorted.length === 3) {
    const heroId = heroes[0].id;
    const others = sorted.filter((p) => p.id !== heroId);
    const styles = new Map<string, React.CSSProperties>();
    styles.set(heroId, { gridRow: "1 / -1", gridColumn: "1" });
    styles.set(others[0].id, { gridRow: "1", gridColumn: "2" });
    styles.set(others[1].id, { gridRow: "2", gridColumn: "2" });

    return {
      display: "grid",
      gridTemplateColumns: "3fr 2fr",
      gridTemplateRows: "1fr 1fr",
      panelStyles: styles,
    };
  }

  // Default: equal-column grid
  const cols = sorted.length <= 4 ? 2 : 3;
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    panelStyles: new Map(),
  };
}

/**
 * Resolve any LayoutConfig to a ResolvedLayout.
 */
export function resolveLayout(
  layout: LayoutConfig,
  panels: PanelV2[],
): ResolvedLayout {
  if (layout === "auto") {
    return computeAutoLayout(panels);
  }

  if (layout === "split" || layout === "split-horizontal") {
    return { display: "flex", direction: "row", panelStyles: new Map() };
  }

  if (layout === "split-vertical") {
    return { display: "flex", direction: "column", panelStyles: new Map() };
  }

  if (layout === "tabs") {
    // Tabs are handled differently in the renderer — only one panel visible at a time
    return { display: "flex", direction: "column", panelStyles: new Map() };
  }

  if (layout === "grid") {
    const cols = panels.length <= 4 ? 2 : 3;
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      panelStyles: new Map(),
    };
  }

  if (typeof layout === "object" && layout.type === "grid") {
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
      gridTemplateRows: layout.rows ? `repeat(${layout.rows}, 1fr)` : undefined,
      panelStyles: new Map(),
    };
  }

  if (typeof layout === "object" && layout.type === "named") {
    return resolveNamedLayout(layout.preset, panels);
  }

  // Fallback
  return { display: "flex", direction: "row", panelStyles: new Map() };
}
