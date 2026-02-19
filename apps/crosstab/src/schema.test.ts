import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("crosstab schema validation", () => {
  it("accepts minimal valid crosstab", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      rowHeaders: ["Row 1"],
      columnHeaders: ["Col 1"],
      values: [[42]],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts crosstab with all options", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      title: "Sales Matrix",
      rowHeaders: ["North", "South"],
      columnHeaders: ["Q1", "Q2"],
      values: [
        [100, 200],
        [150, 250],
      ],
      formatting: "heatmap",
      colorScale: { min: "#ffffff", max: "#000000" },
      showTotals: true,
      annotations: [
        { row: 0, col: 1, label: "Peak", highlight: true },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all formatting values", () => {
    const modes = ["none", "heatmap", "bars", "percentage"];
    for (const formatting of modes) {
      const data = {
        type: "crosstab",
        version: "1.0",
        rowHeaders: ["A"],
        columnHeaders: ["B"],
        values: [[10]],
        formatting,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing rowHeaders", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      columnHeaders: ["Q1"],
      values: [[10]],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing columnHeaders", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      rowHeaders: ["A"],
      values: [[10]],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing values", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      rowHeaders: ["A"],
      columnHeaders: ["B"],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "table",
      version: "1.0",
      rowHeaders: ["A"],
      columnHeaders: ["B"],
      values: [[10]],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid formatting value", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      rowHeaders: ["A"],
      columnHeaders: ["B"],
      values: [[10]],
      formatting: "sparkline",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects non-number values", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      rowHeaders: ["A"],
      columnHeaders: ["B"],
      values: [["not-a-number"]],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      rowHeaders: ["A"],
      columnHeaders: ["B"],
      values: [[10]],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts annotation without optional fields", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      rowHeaders: ["A"],
      columnHeaders: ["B"],
      values: [[10]],
      annotations: [{ row: 0, col: 0 }],
    };
    expect(validate(data)).toBe(true);
  });
});
