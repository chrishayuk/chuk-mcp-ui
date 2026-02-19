import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("scatter schema validation", () => {
  it("accepts minimal valid scatter", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        {
          label: "Points",
          points: [{ x: 1, y: 2 }],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts scatter with all optional fields", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      title: "Full Scatter",
      subtitle: "With all options",
      datasets: [
        {
          label: "Dataset A",
          points: [
            { x: 1, y: 2, r: 5, label: "Point 1", metadata: { group: "A" } },
            { x: 3, y: 4, r: 10, label: "Point 2", metadata: { group: "B" } },
          ],
          color: "#ff0000",
          pointStyle: "circle",
          pointRadius: 6,
        },
      ],
      xAxis: { label: "X", type: "linear", min: 0, max: 10 },
      yAxis: { label: "Y", type: "linear", min: 0, max: 10 },
      legend: { position: "bottom" },
      zoom: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts multiple datasets", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        { label: "A", points: [{ x: 1, y: 2 }] },
        { label: "B", points: [{ x: 3, y: 4 }] },
        { label: "C", points: [{ x: 5, y: 6 }] },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts bubble points with r values", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        {
          label: "Bubbles",
          points: [
            { x: 10, y: 20, r: 5 },
            { x: 30, y: 40, r: 15 },
            { x: 50, y: 10, r: 25 },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts logarithmic axis type", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        { label: "Log", points: [{ x: 10, y: 100 }, { x: 100, y: 1000 }] },
      ],
      xAxis: { type: "logarithmic" },
      yAxis: { type: "logarithmic" },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all point styles", () => {
    const styles = ["circle", "cross", "rect", "triangle", "star"];
    for (const pointStyle of styles) {
      const data = {
        type: "scatter",
        version: "1.0",
        datasets: [
          { label: "Styled", points: [{ x: 1, y: 2 }], pointStyle },
        ],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts all legend positions", () => {
    const positions = ["top", "bottom", "left", "right", "none"];
    for (const position of positions) {
      const data = {
        type: "scatter",
        version: "1.0",
        datasets: [{ label: "A", points: [{ x: 1, y: 2 }] }],
        legend: { position },
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      datasets: [{ label: "A", points: [{ x: 1, y: 2 }] }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      datasets: [{ label: "A", points: [{ x: 1, y: 2 }] }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "scatter",
      datasets: [{ label: "A", points: [{ x: 1, y: 2 }] }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing datasets", () => {
    const data = {
      type: "scatter",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects point missing x", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        { label: "Bad", points: [{ y: 2 }] },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects point missing y", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        { label: "Bad", points: [{ x: 1 }] },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid point style", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        { label: "Bad", points: [{ x: 1, y: 2 }], pointStyle: "diamond" },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid axis type", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [{ label: "A", points: [{ x: 1, y: 2 }] }],
      xAxis: { type: "category" },
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts empty points array", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [{ label: "Empty", points: [] }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts points with metadata", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        {
          label: "Meta",
          points: [
            { x: 1, y: 2, metadata: { group: "alpha", note: "first" } },
          ],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });
});
