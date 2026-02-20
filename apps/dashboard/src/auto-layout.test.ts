import { describe, it, expect } from "vitest";
import { computeAutoLayout, resolveLayout } from "./auto-layout";
import type { PanelV2 } from "./schema";

function panel(id: string, viewType?: string, priority?: number): PanelV2 {
  return { id, viewType, structuredContent: {}, priority };
}

describe("computeAutoLayout", () => {
  it("returns flex row for empty panels", () => {
    const result = computeAutoLayout([]);
    expect(result.display).toBe("flex");
    expect(result.direction).toBe("row");
  });

  it("returns flex row for single panel", () => {
    const result = computeAutoLayout([panel("p1", "chart")]);
    expect(result.display).toBe("flex");
    expect(result.direction).toBe("row");
  });

  it("returns 1fr 1fr for two same viewType (compare)", () => {
    const result = computeAutoLayout([
      panel("p1", "chart"),
      panel("p2", "chart"),
    ]);
    expect(result.display).toBe("grid");
    expect(result.gridTemplateColumns).toBe("1fr 1fr");
  });

  it("returns 3fr 2fr for two panels with hero", () => {
    const result = computeAutoLayout([
      panel("p1", "map"),
      panel("p2", "datatable"),
    ]);
    expect(result.display).toBe("grid");
    expect(result.gridTemplateColumns).toBe("3fr 2fr");
  });

  it("returns 1fr 1fr for two panels without hero", () => {
    const result = computeAutoLayout([
      panel("p1", "chart"),
      panel("p2", "datatable"),
    ]);
    expect(result.display).toBe("grid");
    expect(result.gridTemplateColumns).toBe("1fr 1fr");
  });

  it("returns KPI strip for all compact types", () => {
    const result = computeAutoLayout([
      panel("c1", "counter"),
      panel("c2", "gauge"),
      panel("c3", "status"),
    ]);
    expect(result.display).toBe("grid");
    expect(result.gridTemplateColumns).toBe("repeat(3, 1fr)");
  });

  it("caps KPI strip at 4 columns", () => {
    const result = computeAutoLayout([
      panel("c1", "counter"),
      panel("c2", "gauge"),
      panel("c3", "status"),
      panel("c4", "progress"),
      panel("c5", "counter"),
    ]);
    expect(result.display).toBe("grid");
    expect(result.gridTemplateColumns).toBe("repeat(4, 1fr)");
  });

  it("creates KPI strip + content for mixed compact and other panels", () => {
    const result = computeAutoLayout([
      panel("c1", "counter"),
      panel("c2", "gauge"),
      panel("main", "chart"),
    ]);
    expect(result.display).toBe("grid");
    expect(result.gridTemplateRows).toBe("auto 1fr");
    expect(result.panelStyles.get("c1")).toEqual(expect.objectContaining({ gridRow: 1 }));
    expect(result.panelStyles.get("c2")).toEqual(expect.objectContaining({ gridRow: 1 }));
    expect(result.panelStyles.get("main")).toEqual(expect.objectContaining({ gridRow: 2 }));
  });

  it("creates hero-sidebar for 1 hero + 2 others", () => {
    const result = computeAutoLayout([
      panel("map", "map"),
      panel("table", "datatable"),
      panel("chart", "chart"),
    ]);
    expect(result.display).toBe("grid");
    expect(result.gridTemplateColumns).toBe("3fr 2fr");
    expect(result.panelStyles.get("map")).toEqual(
      expect.objectContaining({ gridRow: "1 / -1", gridColumn: "1" }),
    );
    expect(result.panelStyles.get("table")).toEqual(
      expect.objectContaining({ gridColumn: "2" }),
    );
    expect(result.panelStyles.get("chart")).toEqual(
      expect.objectContaining({ gridColumn: "2" }),
    );
  });

  it("uses 2 columns for 3-4 panels (default)", () => {
    const result = computeAutoLayout([
      panel("p1", "chart"),
      panel("p2", "datatable"),
      panel("p3", "form"),
      panel("p4", "markdown"),
    ]);
    expect(result.display).toBe("grid");
    expect(result.gridTemplateColumns).toBe("repeat(2, 1fr)");
  });

  it("uses 3 columns for 5+ panels (default)", () => {
    const panels = Array.from({ length: 5 }, (_, i) => panel(`p${i}`, "chart"));
    const result = computeAutoLayout(panels);
    expect(result.display).toBe("grid");
    expect(result.gridTemplateColumns).toBe("repeat(3, 1fr)");
  });

  it("sorts by priority before applying rules", () => {
    const result = computeAutoLayout([
      panel("table", "datatable", 20),
      panel("map", "map", 10),
    ]);
    // map is hero and has higher priority (lower number), should result in 3fr 2fr
    expect(result.gridTemplateColumns).toBe("3fr 2fr");
  });
});

describe("resolveLayout", () => {
  const panels = [panel("p1", "map"), panel("p2", "datatable")];

  it("resolves 'auto' via computeAutoLayout", () => {
    const result = resolveLayout("auto", panels);
    expect(result.display).toBe("grid");
  });

  it("resolves 'split' as flex row", () => {
    const result = resolveLayout("split", panels);
    expect(result.display).toBe("flex");
    expect(result.direction).toBe("row");
  });

  it("resolves 'split-horizontal' as flex row", () => {
    const result = resolveLayout("split-horizontal", panels);
    expect(result.display).toBe("flex");
    expect(result.direction).toBe("row");
  });

  it("resolves 'split-vertical' as flex column", () => {
    const result = resolveLayout("split-vertical", panels);
    expect(result.display).toBe("flex");
    expect(result.direction).toBe("column");
  });

  it("resolves 'tabs' as flex column", () => {
    const result = resolveLayout("tabs", panels);
    expect(result.display).toBe("flex");
    expect(result.direction).toBe("column");
  });

  it("resolves 'grid' string with 2 columns for ≤4 panels", () => {
    const result = resolveLayout("grid", panels);
    expect(result.display).toBe("grid");
    expect(result.gridTemplateColumns).toBe("repeat(2, 1fr)");
  });

  it("resolves grid object layout", () => {
    const result = resolveLayout({ type: "grid", columns: 4 }, panels);
    expect(result.display).toBe("grid");
    expect(result.gridTemplateColumns).toBe("repeat(4, 1fr)");
  });

  it("resolves grid object with rows", () => {
    const result = resolveLayout({ type: "grid", columns: 3, rows: 2 }, panels);
    expect(result.gridTemplateRows).toBe("repeat(2, 1fr)");
  });

  it("resolves named layout", () => {
    const result = resolveLayout({ type: "named", preset: "investigation" }, [
      panel("map", "map"),
      panel("table", "datatable"),
      panel("chart", "chart"),
    ]);
    expect(result.display).toBe("grid");
    expect(result.panelStyles.size).toBeGreaterThan(0);
  });

  it("returns flex row fallback for unknown layout", () => {
    // @ts-expect-error - testing unknown layout
    const result = resolveLayout("unknown-layout", panels);
    expect(result.display).toBe("flex");
    expect(result.direction).toBe("row");
  });
});
