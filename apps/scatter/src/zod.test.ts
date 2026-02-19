import { describe, it, expect } from "vitest";
import { scatterSchema } from "./zod";

describe("scatter zod schema validation", () => {
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
    expect(scatterSchema.safeParse(data).success).toBe(true);
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
    expect(scatterSchema.safeParse(data).success).toBe(true);
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
          ],
        },
      ],
    };
    expect(scatterSchema.safeParse(data).success).toBe(true);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      datasets: [{ label: "A", points: [{ x: 1, y: 2 }] }],
    };
    expect(scatterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing datasets", () => {
    const data = {
      type: "scatter",
      version: "1.0",
    };
    expect(scatterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects point with missing x", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        { label: "Bad", points: [{ y: 2 }] },
      ],
    };
    expect(scatterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects point with missing y", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        { label: "Bad", points: [{ x: 1 }] },
      ],
    };
    expect(scatterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid point style", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        { label: "Bad", points: [{ x: 1, y: 2 }], pointStyle: "diamond" },
      ],
    };
    expect(scatterSchema.safeParse(data).success).toBe(false);
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
      expect(scatterSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts logarithmic axis types", () => {
    const data = {
      type: "scatter",
      version: "1.0",
      datasets: [
        { label: "Log", points: [{ x: 10, y: 100 }] },
      ],
      xAxis: { type: "logarithmic" },
      yAxis: { type: "logarithmic" },
    };
    expect(scatterSchema.safeParse(data).success).toBe(true);
  });
});
