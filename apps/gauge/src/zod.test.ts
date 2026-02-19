import { describe, it, expect } from "vitest";
import { gaugeSchema } from "./zod";

describe("gauge zod schema validation", () => {
  it("accepts minimal valid gauge", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      value: 50,
    };
    expect(gaugeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts gauge with all options", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      title: "Speed",
      value: 72,
      min: 0,
      max: 120,
      unit: "mph",
      thresholds: [
        { value: 60, color: "#22c55e", label: "Normal" },
        { value: 90, color: "#f59e0b", label: "Warning" },
        { value: 120, color: "#ef4444", label: "Danger" },
      ],
      format: "number" as const,
      size: "lg" as const,
      subtitle: "Current speed",
    };
    expect(gaugeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts gauge with thresholds", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      value: 68,
      thresholds: [
        { value: 50, color: "#22c55e" },
        { value: 80, color: "#f59e0b" },
        { value: 100, color: "#ef4444" },
      ],
    };
    expect(gaugeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all size options", () => {
    const sizes = ["sm", "md", "lg"] as const;
    for (const size of sizes) {
      const data = {
        type: "gauge" as const,
        version: "1.0" as const,
        value: 50,
        size,
      };
      expect(gaugeSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing value", () => {
    const data = {
      type: "gauge",
      version: "1.0",
    };
    expect(gaugeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      value: 50,
    };
    expect(gaugeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "gauge",
      value: 50,
    };
    expect(gaugeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: 50,
    };
    expect(gaugeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid size", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      value: 50,
      size: "xl",
    };
    expect(gaugeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid format", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      value: 50,
      format: "currency",
    };
    expect(gaugeSchema.safeParse(data).success).toBe(false);
  });
});
