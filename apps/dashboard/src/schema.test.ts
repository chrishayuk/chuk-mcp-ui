import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("dashboard schema validation", () => {
  it("accepts minimal valid dashboard", () => {
    const data = {
      type: "dashboard",
      version: "1.0",
      layout: "split-horizontal",
      panels: [
        {
          id: "left",
          viewUrl: "https://chuk-mcp-ui-views.fly.dev/datatable/v1",
          structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] },
        },
      ],
    };
    expect(validate(data)).toBe(true);
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
          viewUrl: "https://chuk-mcp-ui-views.fly.dev/map/v1",
          structuredContent: { type: "map", version: "1.0", layers: [] },
          width: "60%",
          height: "400px",
          minWidth: "300px",
          minHeight: "200px",
        },
        {
          id: "table",
          label: "Results",
          viewUrl: "https://chuk-mcp-ui-views.fly.dev/datatable/v1",
          structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] },
          width: "40%",
        },
      ],
    };
    expect(validate(data)).toBe(true);
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
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing layout", () => {
    const data = {
      type: "dashboard",
      version: "1.0",
      panels: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing panels", () => {
    const data = {
      type: "dashboard",
      version: "1.0",
      layout: "grid",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects panel missing id", () => {
    const data = {
      type: "dashboard",
      version: "1.0",
      layout: "grid",
      panels: [{ viewUrl: "https://x.com/v", structuredContent: {} }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      layout: "grid",
      panels: [],
    };
    expect(validate(data)).toBe(false);
  });
});

describe("dashboard v2.0 schema validation", () => {
  it("accepts minimal v2.0 with viewType", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [
        { id: "p1", viewType: "map", structuredContent: {} },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts minimal v2.0 with viewUrl", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [
        { id: "p1", viewUrl: "https://example.com/v", structuredContent: {} },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts v2.0 with both viewUrl and viewType", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [
        { id: "p1", viewUrl: "https://example.com/v", viewType: "map", structuredContent: {} },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects v2.0 panel without viewUrl or viewType", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [
        { id: "p1", structuredContent: {} },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts all v2.0 string layouts", () => {
    for (const layout of ["auto", "split", "split-horizontal", "split-vertical", "tabs", "grid"]) {
      const data = {
        type: "dashboard",
        version: "2.0",
        layout,
        panels: [{ id: "p1", viewType: "chart", structuredContent: {} }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts grid layout object", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: { type: "grid", columns: 3, rows: 2 },
      panels: [{ id: "p1", viewType: "chart", structuredContent: {} }],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects grid layout with columns out of range", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: { type: "grid", columns: 0 },
      panels: [{ id: "p1", viewType: "chart", structuredContent: {} }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts named layout presets", () => {
    for (const preset of ["map-sidebar", "dashboard-kpi", "investigation", "report", "compare"]) {
      const data = {
        type: "dashboard",
        version: "2.0",
        layout: { type: "named", preset },
        panels: [{ id: "p1", viewType: "map", structuredContent: {} }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts full v2.0 dashboard with all options", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      title: "Investigation Board",
      layout: { type: "named", preset: "investigation" },
      gap: "12px",
      panels: [
        {
          id: "map",
          label: "Map",
          viewType: "map",
          structuredContent: { type: "map", version: "1.0", layers: [] },
          priority: 10,
          selectionField: "feature_id",
        },
        {
          id: "table",
          label: "Results",
          viewType: "datatable",
          structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] },
          priority: 20,
          width: "40%",
          showWhen: { linkedPanelHasSelection: "map" },
        },
        {
          id: "detail",
          label: "Detail",
          viewType: "detail",
          structuredContent: {},
          collapsed: true,
        },
      ],
      links: [
        {
          source: "map",
          target: "table",
          type: "selection",
          sourceField: "feature_id",
          targetField: "id",
          bidirectional: true,
        },
      ],
      viewRegistry: { "custom-view": "https://example.com/custom/v1" },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts cross-view links with all types", () => {
    for (const linkType of ["selection", "filter", "highlight", "navigate", "update"]) {
      const data = {
        type: "dashboard",
        version: "2.0",
        layout: "auto",
        panels: [
          { id: "a", viewType: "map", structuredContent: {} },
          { id: "b", viewType: "datatable", structuredContent: {} },
        ],
        links: [
          { source: "a", target: "b", type: linkType, sourceField: "x", targetField: "y" },
        ],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects link with invalid type", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [
        { id: "a", viewType: "map", structuredContent: {} },
      ],
      links: [
        { source: "a", target: "b", type: "invalid", sourceField: "x", targetField: "y" },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects link missing required fields", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [
        { id: "a", viewType: "map", structuredContent: {} },
      ],
      links: [
        { source: "a", target: "b", type: "selection" },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts panel with showWhen condition", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [
        { id: "p1", viewType: "map", structuredContent: {} },
        { id: "p2", viewType: "detail", structuredContent: {}, showWhen: { linkedPanelHasSelection: "p1" } },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts panel with collapsed flag", () => {
    const data = {
      type: "dashboard",
      version: "2.0",
      layout: "auto",
      panels: [
        { id: "p1", viewType: "chart", structuredContent: {}, collapsed: true },
      ],
    };
    expect(validate(data)).toBe(true);
  });
});
