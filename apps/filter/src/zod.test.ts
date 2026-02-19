import { describe, it, expect } from "vitest";
import { filterSchema } from "./zod";

describe("filter zod schema validation", () => {
  it("accepts minimal valid filter", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [
        { id: "search", label: "Search", type: "text" },
      ],
    };
    expect(filterSchema.safeParse(data).success).toBe(true);
  });

  it("accepts filter with all top-level options", () => {
    const data = {
      type: "filter",
      version: "1.0",
      title: "My Filters",
      layout: "wrap",
      submitMode: "button",
      resetLabel: "Clear All",
      filters: [
        {
          id: "q",
          label: "Query",
          type: "text",
          placeholder: "Search...",
        },
      ],
    };
    expect(filterSchema.safeParse(data).success).toBe(true);
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
    ] as const;
    for (const type of types) {
      const data = {
        type: "filter" as const,
        version: "1.0" as const,
        filters: [{ id: "f1", label: "Field", type }],
      };
      expect(filterSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts select field with options including counts", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [
        {
          id: "cat",
          label: "Category",
          type: "select",
          options: [
            { value: "a", label: "Alpha", count: 10 },
            { value: "b", label: "Beta" },
          ],
        },
      ],
    };
    expect(filterSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing filters array", () => {
    const data = {
      type: "filter",
      version: "1.0",
      title: "Filters",
    };
    expect(filterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type literal", () => {
    const data = {
      type: "settings",
      version: "1.0",
      filters: [{ id: "f1", label: "F", type: "text" }],
    };
    expect(filterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid field type", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [{ id: "f1", label: "F", type: "textarea" }],
    };
    expect(filterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects field missing id", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [{ label: "Search", type: "text" }],
    };
    expect(filterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects field missing label", () => {
    const data = {
      type: "filter",
      version: "1.0",
      filters: [{ id: "f1", type: "text" }],
    };
    expect(filterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid layout value", () => {
    const data = {
      type: "filter",
      version: "1.0",
      layout: "grid",
      filters: [{ id: "f1", label: "F", type: "text" }],
    };
    expect(filterSchema.safeParse(data).success).toBe(false);
  });
});
