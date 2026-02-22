import { describe, it, expect } from "vitest";
import { dashboardSchema, uiPatchSchema } from "./zod";

describe("dashboard zod schema validation", () => {
  it("accepts minimal valid dashboard", () => {
    const data = {
      type: "dashboard",
      version: "1.0",
      layout: "split-horizontal",
      panels: [
        {
          id: "left",
          viewUrl: "https://mcp-views.chukai.io/datatable/v1",
          structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] },
        },
      ],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full dashboard with all options", () => {
    const data = {
      type: "dashboard",
      version: "1.0",
      title: "Heritage Explorer",
      layout: "grid",
      gap: "12px",
      panels: [
        {
          id: "map",
          label: "Map",
          viewUrl: "https://mcp-views.chukai.io/map/v1",
          structuredContent: { type: "map", version: "1.0", layers: [] },
          width: "60%",
          height: "400px",
          minWidth: "300px",
          minHeight: "200px",
        },
        {
          id: "table",
          label: "Results",
          viewUrl: "https://mcp-views.chukai.io/datatable/v1",
          structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] },
          width: "40%",
        },
      ],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all layout types", () => {
    for (const layout of ["split-horizontal", "split-vertical", "grid"]) {
      const data = {
        type: "dashboard",
        version: "1.0",
        layout,
        panels: [
          { id: "p1", viewUrl: "https://x.com/v", structuredContent: {} },
        ],
      };
      expect(dashboardSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing layout", () => {
    const data = {
      type: "dashboard",
      version: "1.0",
      panels: [],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing panels", () => {
    const data = {
      type: "dashboard",
      version: "1.0",
      layout: "grid",
    };
    expect(dashboardSchema.safeParse(data).success).toBe(false);
  });

  it("rejects panel missing id", () => {
    const data = {
      type: "dashboard",
      version: "1.0",
      layout: "grid",
      panels: [{ viewUrl: "https://x.com/v", structuredContent: {} }],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      layout: "grid",
      panels: [],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(false);
  });
});

describe("dashboard v2.0 zod validation", () => {
  it("accepts minimal v2.0 with viewType", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [{ id: "p1", viewType: "map", structuredContent: {} }],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(true);
  });

  it("accepts minimal v2.0 with viewUrl", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [{ id: "p1", viewUrl: "https://example.com/v", structuredContent: {} }],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(true);
  });

  it("rejects v2.0 panel without viewUrl or viewType", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [{ id: "p1", structuredContent: {} }],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(false);
  });

  it("accepts all v2.0 string layouts", () => {
    for (const layout of ["auto", "split", "split-horizontal", "split-vertical", "tabs", "grid"]) {
      const data = {
        type: "dashboard",
        version: "2.0",
        layout,
        panels: [{ id: "p1", viewType: "chart", structuredContent: {} }],
      };
      expect(dashboardSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts grid layout object", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: { type: "grid", columns: 3, rows: 2 },
      panels: [{ id: "p1", viewType: "chart", structuredContent: {} }],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(true);
  });

  it("rejects grid layout with columns=0", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: { type: "grid", columns: 0 },
      panels: [{ id: "p1", viewType: "chart", structuredContent: {} }],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(false);
  });

  it("rejects grid layout with columns>12", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: { type: "grid", columns: 13 },
      panels: [{ id: "p1", viewType: "chart", structuredContent: {} }],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(false);
  });

  it("accepts all named layout presets", () => {
    for (const preset of ["map-sidebar", "dashboard-kpi", "investigation", "report", "compare"]) {
      const data = {
        type: "dashboard",
        version: "2.0",
        layout: { type: "named", preset },
        panels: [{ id: "p1", viewType: "map", structuredContent: {} }],
      };
      expect(dashboardSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects unknown named preset", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: { type: "named", preset: "unknown" },
      panels: [{ id: "p1", viewType: "map", structuredContent: {} }],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(false);
  });

  it("accepts cross-view links", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [
        { id: "a", viewType: "map", structuredContent: {} },
        { id: "b", viewType: "datatable", structuredContent: {} },
      ],
      links: [{
        source: "a", target: "b", type: "selection",
        sourceField: "feature_id", targetField: "id",
      }],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(true);
  });

  it("rejects link with invalid type", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [{ id: "a", viewType: "map", structuredContent: {} }],
      links: [{
        source: "a", target: "b", type: "invalid",
        sourceField: "x", targetField: "y",
      }],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(false);
  });

  it("accepts full v2.0 dashboard", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      title: "Investigation Board",
      layout: { type: "named", preset: "investigation" },
      gap: "12px",
      panels: [
        { id: "map", viewType: "map", structuredContent: {}, priority: 10, selectionField: "fid" },
        { id: "table", viewType: "datatable", structuredContent: {}, showWhen: { linkedPanelHasSelection: "map" } },
        { id: "detail", viewType: "detail", structuredContent: {}, collapsed: true },
      ],
      links: [{
        source: "map", target: "table", type: "selection",
        sourceField: "fid", targetField: "id", bidirectional: true,
      }],
      viewRegistry: { "custom": "https://example.com/custom/v1" },
    };
    expect(dashboardSchema.safeParse(data).success).toBe(true);
  });

  it("still accepts v1.0 through discriminated union", () => {
    const data = {
      type: "dashboard",
      version: "1.0",
      layout: "grid",
      panels: [{ id: "p1", viewUrl: "https://x.com/v", structuredContent: {} }],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(true);
  });

  it("rejects unknown version", () => {
    const data = {
      type: "dashboard",
      version: "9.0",
      layout: "auto",
      panels: [],
    };
    expect(dashboardSchema.safeParse(data).success).toBe(false);
  });
});

describe("ui patch zod validation", () => {
  it("accepts valid patch with multiple ops", () => {
    const patch = {
      type: "ui_patch",
      version: "3.0",
      ops: [
        { op: "add-panel", panel: { id: "new", viewType: "chart", structuredContent: {} } },
        { op: "remove-panel", panelId: "old" },
        { op: "update-panel", panelId: "p1", action: "merge", data: { title: "Updated" } },
        { op: "show-panel", panelId: "p1", visible: true },
        { op: "collapse-panel", panelId: "p1", collapsed: false },
        { op: "set-loading", panelId: "p1", loading: true },
        { op: "set-error", panelId: "p1", error: "Something failed" },
        { op: "set-error", panelId: "p1", error: null },
        { op: "update-layout", layout: "tabs" },
        { op: "add-link", link: { source: "a", target: "b", type: "filter", sourceField: "x", targetField: "y" } },
        { op: "remove-link", source: "a", target: "b" },
      ],
    };
    expect(uiPatchSchema.safeParse(patch).success).toBe(true);
  });

  it("rejects unknown op type", () => {
    const patch = {
      type: "ui_patch",
      version: "3.0",
      ops: [{ op: "unknown-op", panelId: "p1" }],
    };
    expect(uiPatchSchema.safeParse(patch).success).toBe(false);
  });

  it("rejects wrong version", () => {
    const patch = {
      type: "ui_patch",
      version: "1.0",
      ops: [],
    };
    expect(uiPatchSchema.safeParse(patch).success).toBe(false);
  });

  it("accepts empty ops array", () => {
    const patch = {
      type: "ui_patch",
      version: "3.0",
      ops: [],
    };
    expect(uiPatchSchema.safeParse(patch).success).toBe(true);
  });

  it("rejects update-panel with invalid action", () => {
    const patch = {
      type: "ui_patch",
      version: "3.0",
      ops: [{ op: "update-panel", panelId: "p1", action: "invalid", data: {} }],
    };
    expect(uiPatchSchema.safeParse(patch).success).toBe(false);
  });
});
