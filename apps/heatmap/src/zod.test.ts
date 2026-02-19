import { describe, it, expect } from "vitest";
import { heatmapSchema } from "./zod";

describe("heatmap zod schema validation", () => {
  it("accepts minimal valid heatmap", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [[42]],
    };
    expect(heatmapSchema.safeParse(data).success).toBe(true);
  });

  it("accepts heatmap with all options", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      title: "Temperature Grid",
      rows: ["Mon", "Tue"],
      columns: ["6:00", "12:00", "18:00"],
      values: [
        [15, 25, 20],
        [14, 26, 19],
      ],
      colorScale: "sequential" as const,
      minColor: "#ffffff",
      maxColor: "#1e40af",
      midColor: "#f0f0f0",
      showValues: true,
      annotations: [
        { row: 0, col: 1, label: "Peak" },
      ],
    };
    expect(heatmapSchema.safeParse(data).success).toBe(true);
  });

  it("accepts both colorScale values", () => {
    const scales = ["sequential", "diverging"] as const;
    for (const colorScale of scales) {
      const data = {
        type: "heatmap" as const,
        version: "1.0" as const,
        rows: ["A"],
        columns: ["B"],
        values: [[10]],
        colorScale,
      };
      expect(heatmapSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing rows", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      columns: ["B"],
      values: [[10]],
    };
    expect(heatmapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [[10]],
    };
    expect(heatmapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid colorScale value", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [[10]],
      colorScale: "categorical",
    };
    expect(heatmapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects non-number values", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [["not-a-number"]],
    };
    expect(heatmapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing values", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
    };
    expect(heatmapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "heatmap",
      rows: ["A"],
      columns: ["B"],
      values: [[10]],
    };
    expect(heatmapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects annotation without label", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [[10]],
      annotations: [{ row: 0, col: 0 }],
    };
    expect(heatmapSchema.safeParse(data).success).toBe(false);
  });
});
