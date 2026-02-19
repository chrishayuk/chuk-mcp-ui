import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("filter schema validation", () => {
  it("accepts minimal valid filter", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [
        { id: "search", label: "Search", type: "text" },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts filter with all top-level options", () => {
    const data = {
      type: "filter",
      version: "1.0",
      title: "My Filters",
      layout: "horizontal",
      submitMode: "button",
      resetLabel: "Clear All",
      filters: [
        { id: "q", label: "Query", type: "text", placeholder: "Search..." },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all filter field types", () => {
    const types = [
      "text",
      "select",
      "multi-select",
      "date-range",
      "number-range",
      "toggle",
      "checkbox-group",
    ];
    for (const type of types) {
      const data = {
        type: "filter",
        version: "1.0",
        filters: [{ id: "f1", label: "Field", type }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts select field with options and counts", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [
        {
          id: "category",
          label: "Category",
          type: "select",
          options: [
            { value: "a", label: "Alpha", count: 10 },
            { value: "b", label: "Beta" },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts number-range field with min/max", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [
        {
          id: "price",
          label: "Price",
          type: "number-range",
          min: 0,
          max: 1000,
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts field with defaultValue", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [
        {
          id: "toggle",
          label: "Active",
          type: "toggle",
          defaultValue: true,
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing filters array", () => {
    const data = {
      type: "filter",
      version: "1.0",
      title: "Filters",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects filter field missing id", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [{ label: "Search", type: "text" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects filter field missing label", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [{ id: "search", type: "text" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects filter field missing type", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [{ id: "search", label: "Search" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid filter field type", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [{ id: "f1", label: "F", type: "textarea" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type literal", () => {
    const data = {
      type: "settings",
      version: "1.0",
      filters: [{ id: "f1", label: "F", type: "text" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid layout value", () => {
    const data = {
      type: "filter",
      version: "1.0",
      layout: "grid",
      filters: [{ id: "f1", label: "F", type: "text" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid submitMode value", () => {
    const data = {
      type: "filter",
      version: "1.0",
      submitMode: "auto",
      filters: [{ id: "f1", label: "F", type: "text" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [{ id: "f1", label: "F", type: "text" }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all three layout values", () => {
    for (const layout of ["horizontal", "vertical", "wrap"]) {
      const data = {
        type: "filter",
        version: "1.0",
        layout,
        filters: [{ id: "f1", label: "F", type: "text" }],
      };
      expect(validate(data)).toBe(true);
    }
  });
});
