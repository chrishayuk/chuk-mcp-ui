import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("boxplot schema validation", () => {
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
    expect(validate(data)).toBe(true);
  });

  it("accepts boxplot with all options", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      title: "Full Boxplot",
      orientation: "vertical",
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
    expect(validate(data)).toBe(true);
  });

  it("accepts horizontal orientation", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      orientation: "horizontal",
      groups: [
        {
          label: "A",
          stats: { min: 1, q1: 2, median: 3, q3: 4, max: 5 },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts multiple groups", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [
        { label: "A", stats: { min: 1, q1: 2, median: 3, q3: 4, max: 5 } },
        { label: "B", stats: { min: 10, q1: 20, median: 30, q3: 40, max: 50 } },
        { label: "C", stats: { min: 5, q1: 15, median: 25, q3: 35, max: 45 } },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts group with outliers", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [
        {
          label: "With Outliers",
          stats: {
            min: 10,
            q1: 25,
            median: 50,
            q3: 75,
            max: 90,
            outliers: [2, 3, 120, 150],
          },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts group with mean", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [
        {
          label: "With Mean",
          stats: {
            min: 10,
            q1: 25,
            median: 50,
            q3: 75,
            max: 90,
            mean: 48.5,
          },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts negative values in stats", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [
        {
          label: "Negative",
          stats: { min: -50, q1: -20, median: 0, q3: 20, max: 50 },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts yAxis with partial options", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      yAxis: { label: "Score" },
      groups: [
        {
          label: "Test",
          stats: { min: 0, q1: 25, median: 50, q3: 75, max: 100 },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts decimal values", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [
        {
          label: "Decimals",
          stats: { min: 1.5, q1: 2.7, median: 3.3, q3: 4.1, max: 5.9 },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      extra: true,
      groups: [
        {
          label: "A",
          stats: { min: 1, q1: 2, median: 3, q3: 4, max: 5 },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing groups", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects empty groups array", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [],
    };
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
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
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid orientation", () => {
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
    expect(validate(data)).toBe(false);
  });

  it("rejects group missing required stats fields", () => {
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
    expect(validate(data)).toBe(false);
  });

  it("rejects group missing label", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [
        {
          stats: { min: 1, q1: 2, median: 3, q3: 4, max: 5 },
        },
      ],
    };
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
  });

  it("rejects non-number in outliers array", () => {
    const data = {
      type: "boxplot",
      version: "1.0",
      groups: [
        {
          label: "Bad Outliers",
          stats: {
            min: 1,
            q1: 2,
            median: 3,
            q3: 4,
            max: 5,
            outliers: ["high"],
          },
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });
});
