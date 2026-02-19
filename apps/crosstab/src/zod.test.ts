import { describe, it, expect } from "vitest";
import { crosstabSchema } from "./zod";

describe("crosstab zod schema validation", () => {
  it("accepts minimal valid crosstab", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      rowHeaders: ["Row 1"],
      columnHeaders: ["Col 1"],
      values: [[42]],
    };
    expect(crosstabSchema.safeParse(data).success).toBe(true);
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
    expect(crosstabSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all formatting values", () => {
    const modes = ["none", "heatmap", "bars", "percentage"] as const;
    for (const formatting of modes) {
      const data = {
        type: "crosstab" as const,
        version: "1.0" as const,
        rowHeaders: ["A"],
        columnHeaders: ["B"],
        values: [[10]],
        formatting,
      };
      expect(crosstabSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing rowHeaders", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      columnHeaders: ["Q1"],
      values: [[10]],
    };
    expect(crosstabSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "table",
      version: "1.0",
      rowHeaders: ["A"],
      columnHeaders: ["B"],
      values: [[10]],
    };
    expect(crosstabSchema.safeParse(data).success).toBe(false);
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
    expect(crosstabSchema.safeParse(data).success).toBe(false);
  });

  it("rejects non-number values", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      rowHeaders: ["A"],
      columnHeaders: ["B"],
      values: [["not-a-number"]],
    };
    expect(crosstabSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing values", () => {
    const data = {
      type: "crosstab",
      version: "1.0",
      rowHeaders: ["A"],
      columnHeaders: ["B"],
    };
    expect(crosstabSchema.safeParse(data).success).toBe(false);
  });
});
