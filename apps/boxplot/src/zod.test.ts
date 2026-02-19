import { describe, it, expect } from "vitest";
import { boxplotSchema } from "./zod";

describe("boxplot zod schema validation", () => {
  it("accepts minimal valid boxplot", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [
        {
          label: "Group A",
          stats: { min: 10, q1: 25, median: 50, q3: 75, max: 90 },
        },
      ],
    };
    expect(boxplotSchema.safeParse(data).success).toBe(true);
  });

  it("accepts boxplot with all options", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      title: "Full Boxplot",
      orientation: "vertical" as const,
      showOutliers: true,
      yAxis: { label: "Value", min: 0, max: 200 },
      groups: [
        {
          label: "Dept A",
          color: "#3388ff",
          stats: {
            min: 20,
            q1: 40,
            median: 60,
            q3: 80,
            max: 100,
            outliers: [5, 150],
            mean: 58,
          },
        },
        {
          label: "Dept B",
          color: "#ff6384",
          stats: {
            min: 30,
            q1: 50,
            median: 70,
            q3: 90,
            max: 110,
            mean: 68,
          },
        },
      ],
    };
    expect(boxplotSchema.safeParse(data).success).toBe(true);
  });

  it("accepts horizontal orientation", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      orientation: "horizontal" as const,
      groups: [
        {
          label: "A",
          stats: { min: 1, q1: 2, median: 3, q3: 4, max: 5 },
        },
      ],
    };
    expect(boxplotSchema.safeParse(data).success).toBe(true);
  });

  it("rejects empty groups array", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [],
    };
    expect(boxplotSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      groups: [
        {
          label: "A",
          stats: { min: 1, q1: 2, median: 3, q3: 4, max: 5 },
        },
      ],
    };
    expect(boxplotSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "boxplot",
      groups: [
        {
          label: "A",
          stats: { min: 1, q1: 2, median: 3, q3: 4, max: 5 },
        },
      ],
    };
    expect(boxplotSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type literal", () => {
    const data = {
      type: "chart",
      version: "1.0",
      groups: [
        {
          label: "A",
          stats: { min: 1, q1: 2, median: 3, q3: 4, max: 5 },
        },
      ],
    };
    expect(boxplotSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid orientation value", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      orientation: "diagonal",
      groups: [
        {
          label: "A",
          stats: { min: 1, q1: 2, median: 3, q3: 4, max: 5 },
        },
      ],
    };
    expect(boxplotSchema.safeParse(data).success).toBe(false);
  });

  it("rejects stats missing required field", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [
        {
          label: "Incomplete",
          stats: { min: 1, q1: 2, median: 3 },
        },
      ],
    };
    expect(boxplotSchema.safeParse(data).success).toBe(false);
  });

  it("rejects non-number in stats", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [
        {
          label: "Bad",
          stats: { min: "low", q1: 2, median: 3, q3: 4, max: 5 },
        },
      ],
    };
    expect(boxplotSchema.safeParse(data).success).toBe(false);
  });
});
