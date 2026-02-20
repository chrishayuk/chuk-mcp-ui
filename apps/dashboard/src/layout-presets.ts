import type { PanelV2, NamedLayoutPreset } from "./schema";
import type { ResolvedLayout } from "./auto-layout";

const COMPACT_TYPES = new Set(["counter", "gauge", "status", "progress"]);

function mapSidebar(_panels: PanelV2[]): ResolvedLayout {
  return {
    display: "grid",
    gridTemplateColumns: "3fr 2fr",
    gridTemplateRows: "1fr",
    panelStyles: new Map(),
  };
}

function dashboardKpi(panels: PanelV2[]): ResolvedLayout {
  const compacts = panels.filter((p) => COMPACT_TYPES.has(p.viewType ?? ""));
  const others = panels.filter((p) => !COMPACT_TYPES.has(p.viewType ?? ""));
  const kpiCount = Math.max(compacts.length, 1);
  const styles = new Map<string, React.CSSProperties>();

  for (const c of compacts) {
    styles.set(c.id, { gridRow: 1 });
  }
  for (const o of others) {
    styles.set(o.id, { gridRow: 2, gridColumn: `1 / -1` });
  }

  return {
    display: "grid",
    gridTemplateColumns: `repeat(${kpiCount}, 1fr)`,
    gridTemplateRows: "auto 1fr",
    panelStyles: styles,
  };
}

function investigation(panels: PanelV2[]): ResolvedLayout {
  const styles = new Map<string, React.CSSProperties>();

  // First panel (usually map) spans left column full height
  if (panels[0]) {
    styles.set(panels[0].id, { gridRow: "1 / -1", gridColumn: "1" });
  }
  // Remaining panels stack in right column
  for (let i = 1; i < panels.length; i++) {
    styles.set(panels[i].id, { gridRow: String(i), gridColumn: "2" });
  }

  const rightRows = Math.max(panels.length - 1, 1);
  return {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: `repeat(${rightRows}, 1fr)`,
    panelStyles: styles,
  };
}

function report(_panels: PanelV2[]): ResolvedLayout {
  return {
    display: "flex",
    direction: "column",
    panelStyles: new Map(),
  };
}

function compare(panels: PanelV2[]): ResolvedLayout {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${Math.min(panels.length, 3)}, 1fr)`,
    panelStyles: new Map(),
  };
}

const PRESETS: Record<NamedLayoutPreset, (panels: PanelV2[]) => ResolvedLayout> = {
  "map-sidebar": mapSidebar,
  "dashboard-kpi": dashboardKpi,
  investigation,
  report,
  compare,
};

export function resolveNamedLayout(
  preset: NamedLayoutPreset,
  panels: PanelV2[],
): ResolvedLayout {
  const resolver = PRESETS[preset];
  if (!resolver) {
    return { display: "flex", direction: "row", panelStyles: new Map() };
  }
  return resolver(panels);
}
