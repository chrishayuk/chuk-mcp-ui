import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("sunburst schema validation", () => {
  it("accepts minimal valid sunburst", () => {
    const data = {
      type: "sunburst",
      version: "1.0",
      root: { id: "root", label: "Root" },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts sunburst with all optional fields", () => {
    const data = {
      type: "sunburst",
      version: "1.0",
      title: "My Chart",
      showLabels: true,
      interactive: false,
      root: {
        id: "root",
        label: "Root",
        value: 100,
        color: "#3b82f6",
        children: [
          {
            id: "a",
            label: "A",
            value: 60,
            color: "#ef4444",
          },
          {
            id: "b",
            label: "B",
            value: 40,
          },
        ],
      },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts deeply nested children (recursive)", () => {
    const data = {
      type: "sunburst",
      version: "1.0",
      root: {
        id: "a",
        label: "A",
        children: [
          {
            id: "b",
            label: "B",
            children: [
              {
                id: "c",
                label: "C",
                children: [
                  { id: "d", label: "D", value: 10 },
                ],
              },
            ],
          },
        ],
      },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts root with no children (leaf root)", () => {
    const data = {
      type: "sunburst",
      version: "1.0",
      root: { id: "solo", label: "Solo Node", value: 42 },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts root with empty children array", () => {
    const data = {
      type: "sunburst",
      version: "1.0",
      root: { id: "root", label: "Root", children: [] },
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing type field", () => {
    const data = {
      version: "1.0",
      root: { id: "root", label: "Root" },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version field", () => {
    const data = {
      type: "sunburst",
      root: { id: "root", label: "Root" },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing root field", () => {
    const data = {
      type: "sunburst",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type value", () => {
    const data = {
      type: "chart",
      version: "1.0",
      root: { id: "root", label: "Root" },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong version value", () => {
    const data = {
      type: "sunburst",
      version: "2.0",
      root: { id: "root", label: "Root" },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects node with missing id", () => {
    const data = {
      type: "sunburst",
      version: "1.0",
      root: { label: "Root" },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects node with missing label", () => {
    const data = {
      type: "sunburst",
      version: "1.0",
      root: { id: "root" },
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts node with value and color", () => {
    const data = {
      type: "sunburst",
      version: "1.0",
      root: {
        id: "root",
        label: "Root",
        value: 100,
        color: "#ff0000",
      },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts unknown additional fields for forward compatibility", () => {
    const data = {
      type: "sunburst",
      version: "1.0",
      root: { id: "root", label: "Root" },
      futureField: "some value",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts many siblings at same level", () => {
    const children = Array.from({ length: 20 }, (_, i) => ({
      id: `child-${i}`,
      label: `Child ${i}`,
      value: (i + 1) * 10,
    }));
    const data = {
      type: "sunburst",
      version: "1.0",
      root: { id: "root", label: "Root", children },
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects child node with missing id in nested children", () => {
    const data = {
      type: "sunburst",
      version: "1.0",
      root: {
        id: "root",
        label: "Root",
        children: [
          {
            id: "a",
            label: "A",
            children: [
              { label: "Missing ID" },
            ],
          },
        ],
      },
    };
    expect(validate(data)).toBe(false);
  });
});
