import { describe, it, expect } from "vitest";
import { tabsSchema } from "./zod";

describe("tabs zod schema validation", () => {
  it("accepts minimal valid tabs", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      tabs: [
        {
          id: "tab1",
          label: "Map",
          viewUrl: "https://mcp-views.chukai.io/map/v1",
          structuredContent: { type: "map", version: "1.0", layers: [] },
        },
      ],
    };
    expect(tabsSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full tabs with all options", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      activeTab: "tab2",
      tabs: [
        {
          id: "tab1",
          label: "Map",
          icon: "map",
          viewUrl: "https://mcp-views.chukai.io/map/v1",
          structuredContent: { type: "map", version: "1.0", layers: [] },
        },
        {
          id: "tab2",
          label: "Data",
          icon: "table",
          viewUrl: "https://mcp-views.chukai.io/datatable/v1",
          structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] },
        },
      ],
    };
    expect(tabsSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing tabs array", () => {
    const data = {
      type: "tabs",
      version: "1.0",
    };
    expect(tabsSchema.safeParse(data).success).toBe(false);
  });

  it("rejects tab missing id", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      tabs: [
        {
          label: "Map",
          viewUrl: "https://mcp-views.chukai.io/map/v1",
          structuredContent: {},
        },
      ],
    };
    expect(tabsSchema.safeParse(data).success).toBe(false);
  });

  it("rejects tab missing label", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      tabs: [
        {
          id: "tab1",
          viewUrl: "https://mcp-views.chukai.io/map/v1",
          structuredContent: {},
        },
      ],
    };
    expect(tabsSchema.safeParse(data).success).toBe(false);
  });

  it("rejects tab missing viewUrl", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      tabs: [
        {
          id: "tab1",
          label: "Map",
          structuredContent: {},
        },
      ],
    };
    expect(tabsSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "split",
      version: "1.0",
      tabs: [],
    };
    expect(tabsSchema.safeParse(data).success).toBe(false);
  });

  it("accepts empty tabs array", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      tabs: [],
    };
    expect(tabsSchema.safeParse(data).success).toBe(true);
  });
});
