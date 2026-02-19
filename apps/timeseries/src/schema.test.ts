import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("timeseries schema validation", () => {
  it("accepts minimal valid timeseries", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Metric",
          data: [{ t: "2025-01-01T00:00:00Z", v: 42 }],
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts timeseries with all options", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      title: "Server CPU",
      subtitle: "Last 24 hours",
      series: [
        {
          label: "CPU %",
          data: [
            { t: "2025-01-15T00:00:00Z", v: 45 },
            { t: "2025-01-15T01:00:00Z", v: 52 },
          ],
          color: "#ff6384",
          fill: true,
          type: "line",
        },
      ],
      xAxis: { label: "Time", min: "2025-01-15T00:00:00Z", max: "2025-01-16T00:00:00Z" },
      yAxis: { label: "Usage (%)", min: 0, max: 100, type: "linear" },
      annotations: [
        {
          type: "line",
          start: "2025-01-15T12:00:00Z",
          label: "Deploy",
          color: "#ff9f40",
        },
      ],
      zoom: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts multiple series", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Series A",
          data: [{ t: "2025-01-01", v: 10 }],
        },
        {
          label: "Series B",
          data: [{ t: "2025-01-01", v: 20 }],
          color: "#36a2eb",
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts bar series type", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Revenue",
          data: [{ t: "2024-01-01", v: 50000 }],
          type: "bar",
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts area series type", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Traffic",
          data: [{ t: "2025-02-01", v: 500 }],
          type: "area",
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts range annotation", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Metric",
          data: [{ t: "2025-01-01", v: 10 }],
        },
      ],
      annotations: [
        {
          type: "range",
          start: "2025-01-01T08:00:00Z",
          end: "2025-01-01T10:00:00Z",
          label: "Outage",
          color: "#ff0000",
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts logarithmic y-axis", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Growth",
          data: [
            { t: "2025-01-01", v: 1 },
            { t: "2025-02-01", v: 10 },
            { t: "2025-03-01", v: 100 },
          ],
        },
      ],
      yAxis: { type: "logarithmic" },
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing series", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      series: [{ label: "Test", data: [{ t: "2025-01-01", v: 1 }] }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = {
      type: "timeseries",
      version: "2.0",
      series: [{ label: "Test", data: [{ t: "2025-01-01", v: 1 }] }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid series type", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Bad",
          data: [{ t: "2025-01-01", v: 1 }],
          type: "scatter",
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid y-axis type", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Test",
          data: [{ t: "2025-01-01", v: 1 }],
        },
      ],
      yAxis: { type: "category" },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid annotation type", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Test",
          data: [{ t: "2025-01-01", v: 1 }],
        },
      ],
      annotations: [
        {
          type: "point",
          start: "2025-01-01",
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects data point missing t field", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Bad",
          data: [{ v: 42 }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects data point missing v field", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Bad",
          data: [{ t: "2025-01-01" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects data point with non-numeric v", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Bad",
          data: [{ t: "2025-01-01", v: "not-a-number" }],
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });
});
