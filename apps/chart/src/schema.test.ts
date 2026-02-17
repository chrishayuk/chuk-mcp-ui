import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("chart schema validation", () => {
  it("accepts minimal valid bar chart", () => {
    const data = {
      type: "chart",
      version: "1.0",
      chartType: "bar",
      data: [{ label: "Sales", values: [10, 20, 30] }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts line chart with all options", () => {
    const data = {
      type: "chart",
      version: "1.0",
      title: "Revenue",
      subtitle: "Q1 2024",
      chartType: "line",
      data: [
        {
          label: "Revenue",
          values: [100, 200, 300],
          color: "#ff0000",
          backgroundColor: "#ff000033",
          fill: true,
          borderWidth: 3,
          tension: 0.4,
        },
      ],
      xAxis: { label: "Month", type: "category" },
      yAxis: { label: "USD", type: "linear", min: 0, max: 500, stacked: false },
      legend: { position: "bottom" },
      interactive: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts scatter chart with xy data points", () => {
    const data = {
      type: "chart",
      version: "1.0",
      chartType: "scatter",
      data: [
        {
          label: "Points",
          values: [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts pie chart", () => {
    const data = {
      type: "chart",
      version: "1.0",
      chartType: "pie",
      data: [
        {
          label: "Distribution",
          values: [
            { label: "A", value: 30 },
            { label: "B", value: 70 },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all chart types", () => {
    const types = ["bar", "line", "scatter", "pie", "doughnut", "area", "radar", "bubble"];
    for (const chartType of types) {
      const data = {
        type: "chart",
        version: "1.0",
        chartType,
        data: [{ label: "Test", values: [1, 2, 3] }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing chartType", () => {
    const data = {
      type: "chart",
      version: "1.0",
      data: [{ label: "Test", values: [1] }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing data", () => {
    const data = {
      type: "chart",
      version: "1.0",
      chartType: "bar",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "datatable",
      version: "1.0",
      chartType: "bar",
      data: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid chart type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      chartType: "waterfall",
      data: [],
    };
    expect(validate(data)).toBe(false);
  });
});
