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
