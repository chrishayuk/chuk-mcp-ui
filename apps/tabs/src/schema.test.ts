import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("tabs schema validation", () => {
  it("accepts minimal valid tabs", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      tabs: [
        {
          id: "tab1",
          label: "Map",
          viewUrl: "https://chuk-mcp-ui-views.fly.dev/map/v1",
          structuredContent: { type: "map", version: "1.0", layers: [] },
        },
      ],
    };
    expect(validate(data)).toBe(true);
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
          viewUrl: "https://chuk-mcp-ui-views.fly.dev/map/v1",
          structuredContent: { type: "map", version: "1.0", layers: [] },
        },
        {
          id: "tab2",
          label: "Data",
          icon: "table",
          viewUrl: "https://chuk-mcp-ui-views.fly.dev/datatable/v1",
          structuredContent: { type: "datatable", version: "1.0", columns: [], rows: [] },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing tabs array", () => {
    const data = {
      type: "tabs",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects tab missing id", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      tabs: [
        {
          label: "Map",
          viewUrl: "https://chuk-mcp-ui-views.fly.dev/map/v1",
          structuredContent: {},
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects tab missing label", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      tabs: [
        {
          id: "tab1",
          viewUrl: "https://chuk-mcp-ui-views.fly.dev/map/v1",
          structuredContent: {},
        },
      ],
    };
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "split",
      version: "1.0",
      tabs: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts empty tabs array", () => {
    const data = {
      type: "tabs",
      version: "1.0",
      tabs: [],
    };
    expect(validate(data)).toBe(true);
  });
});
