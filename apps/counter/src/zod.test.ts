import { describe, it, expect } from "vitest";
import { counterSchema } from "./zod";

describe("counter zod schema validation", () => {
  it("accepts minimal valid counter", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: 42,
      label: "Active Users",
    };
    expect(counterSchema.safeParse(data).success).toBe(true);
  });

  it("accepts counter with all options", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: 1234.56,
      label: "Revenue",
      prefix: "$",
      suffix: "/mo",
      delta: { value: 12.5, label: "vs last month" },
      sparkline: [10, 20, 15, 25, 30, 28, 35],
      icon: "dollar-sign",
      color: "success",
    };
    expect(counterSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all color options", () => {
    const colors = ["default", "success", "warning", "danger"] as const;
    for (const color of colors) {
      const data = {
        type: "counter" as const,
        version: "1.0" as const,
        value: 100,
        label: "Test",
        color,
      };
      expect(counterSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts negative value and delta", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: -50,
      label: "Balance",
      delta: { value: -10 },
    };
    expect(counterSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing value", () => {
    const data = {
      type: "counter",
      version: "1.0",
      label: "Test",
    };
    expect(counterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing label", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: 42,
    };
    expect(counterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "detail",
      version: "1.0",
      value: 42,
      label: "Test",
    };
    expect(counterSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid color", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: 42,
      label: "Test",
      color: "purple",
    };
    expect(counterSchema.safeParse(data).success).toBe(false);
  });
});
