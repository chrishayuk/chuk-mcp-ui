import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("form schema validation", () => {
  it("accepts minimal valid form", () => {
    const data = {
      type: "form",
      version: "1.0",
      schema: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      },
      submitTool: "submit-form",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts full form with all options", () => {
    const data = {
      type: "form",
      version: "1.0",
      title: "Search Parameters",
      description: "Configure your search",
      schema: {
        type: "object",
        required: ["query"],
        properties: {
          query: { type: "string", title: "Query" },
          limit: { type: "integer", minimum: 1, maximum: 100 },
        },
      },
      uiSchema: {
        order: ["query", "limit"],
        fields: {
          query: { widget: "text", placeholder: "Search...", help: "Enter keywords" },
          limit: { widget: "slider" },
        },
      },
      initialValues: { query: "", limit: 10 },
      submitTool: "search",
      submitLabel: "Search",
      cancelable: true,
      layout: "vertical",
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing schema", () => {
    const data = {
      type: "form",
      version: "1.0",
      submitTool: "submit",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing submitTool", () => {
    const data = {
      type: "form",
      version: "1.0",
      schema: { type: "object", properties: {} },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      schema: { type: "object", properties: {} },
      submitTool: "submit",
    };
    expect(validate(data)).toBe(false);
  });
});
