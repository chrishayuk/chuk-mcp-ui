import { describe, it, expect } from "vitest";
import { timeseriesSchema } from "./zod";

describe("timeseries zod schema validation", () => {
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
    expect(timeseriesSchema.safeParse(data).success).toBe(true);
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
    expect(timeseriesSchema.safeParse(data).success).toBe(true);
  });

  it("accepts multiple series with different types", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Line Series",
          data: [{ t: "2025-01-01", v: 10 }],
          type: "line",
        },
        {
          label: "Bar Series",
          data: [{ t: "2025-01-01", v: 20 }],
          type: "bar",
        },
        {
          label: "Area Series",
          data: [{ t: "2025-01-01", v: 30 }],
          type: "area",
        },
      ],
    };
    expect(timeseriesSchema.safeParse(data).success).toBe(true);
  });

  it("accepts range annotation with all fields", () => {
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
          label: "Outage Window",
          color: "#ff0000",
        },
      ],
    };
    expect(timeseriesSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing series", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
    };
    expect(timeseriesSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      series: [{ label: "Test", data: [{ t: "2025-01-01", v: 1 }] }],
    };
    expect(timeseriesSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = {
      type: "timeseries",
      version: "2.0",
      series: [{ label: "Test", data: [{ t: "2025-01-01", v: 1 }] }],
    };
    expect(timeseriesSchema.safeParse(data).success).toBe(false);
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
    expect(timeseriesSchema.safeParse(data).success).toBe(false);
  });

  it("rejects data point with missing t", () => {
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
    expect(timeseriesSchema.safeParse(data).success).toBe(false);
  });

  it("rejects data point with non-numeric v", () => {
    const data = {
      type: "timeseries",
      version: "1.0",
      series: [
        {
          label: "Bad",
          data: [{ t: "2025-01-01", v: "text" }],
        },
      ],
    };
    expect(timeseriesSchema.safeParse(data).success).toBe(false);
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
    expect(timeseriesSchema.safeParse(data).success).toBe(false);
  });
});
