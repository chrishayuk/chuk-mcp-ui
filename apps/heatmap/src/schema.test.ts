import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("heatmap schema validation", () => {
  it("accepts minimal valid heatmap", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [[42]],
    };
    expect(validate(data)).toBe(true);
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
      colorScale: "sequential",
      minColor: "#ffffff",
      maxColor: "#1e40af",
      midColor: "#f0f0f0",
      showValues: true,
      annotations: [
        { row: 0, col: 1, label: "Peak" },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts sequential colorScale", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [[10]],
      colorScale: "sequential",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts diverging colorScale", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [[10]],
      colorScale: "diverging",
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing rows", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      columns: ["B"],
      values: [[10]],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing columns", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      values: [[10]],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing values", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [[10]],
    };
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
  });

  it("rejects non-number values", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [["not-a-number"]],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [[10]],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts annotation with all fields", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [[10]],
      annotations: [{ row: 0, col: 0, label: "Note" }],
    };
    expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(false);
  });

  it("accepts multi-row multi-column heatmap", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["R1", "R2", "R3"],
      columns: ["C1", "C2", "C3", "C4"],
      values: [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts negative and decimal values", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B", "C"],
      values: [[-3.5, 2.7]],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts showValues as false", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      rows: ["A"],
      columns: ["B"],
      values: [[10]],
      showValues: false,
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing version", () => {
    const data = {
      type: "heatmap",
      rows: ["A"],
      columns: ["B"],
      values: [[10]],
    };
    expect(validate(data)).toBe(false);
  });
});
