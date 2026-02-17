import { describe, it, expect } from "vitest";
import { splitSchema } from "./zod";

describe("split zod schema validation", () => {
  it("accepts minimal valid split", () => {
    const data = {
      type: "split",
      version: "1.0",
      left: {
        viewUrl: "https://chuk-mcp-ui-views.fly.dev/map/v1",
        structuredContent: { type: "map", version: "1.0", layers: [] },
      },
      right: {
        viewUrl: "https://chuk-mcp-ui-views.fly.dev/datatable/v1",
        structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] },
      },
    };
    expect(splitSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full split with all options", () => {
    const data = {
      type: "split",
      version: "1.0",
      direction: "vertical",
      ratio: "60:40",
      left: {
        label: "Map",
        viewUrl: "https://chuk-mcp-ui-views.fly.dev/map/v1",
        structuredContent: { type: "map", version: "1.0", layers: [] },
      },
      right: {
        label: "Data",
        viewUrl: "https://chuk-mcp-ui-views.fly.dev/datatable/v1",
        structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] },
      },
    };
    expect(splitSchema.safeParse(data).success).toBe(true);
  });

  it("accepts both direction values", () => {
    for (const direction of ["horizontal", "vertical"]) {
      const data = {
        type: "split",
        version: "1.0",
        direction,
        left: { viewUrl: "https://x.com/v", structuredContent: {} },
        right: { viewUrl: "https://x.com/v", structuredContent: {} },
      };
      expect(splitSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing left panel", () => {
    const data = {
      type: "split",
      version: "1.0",
      right: { viewUrl: "https://x.com/v", structuredContent: {} },
    };
    expect(splitSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing right panel", () => {
    const data = {
      type: "split",
      version: "1.0",
      left: { viewUrl: "https://x.com/v", structuredContent: {} },
    };
    expect(splitSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "dashboard",
      version: "1.0",
      left: { viewUrl: "https://x.com/v", structuredContent: {} },
      right: { viewUrl: "https://x.com/v", structuredContent: {} },
    };
    expect(splitSchema.safeParse(data).success).toBe(false);
  });
});
