import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("counter schema validation", () => {
  it("accepts minimal valid counter", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: 42,
      label: "Active Users",
    };
    expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
  });

  it("accepts all color options", () => {
    const colors = ["default", "success", "warning", "danger"];
    for (const color of colors) {
      const data = {
        type: "counter",
        version: "1.0",
        value: 100,
        label: "Test",
        color,
      };
      expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
  });

  it("accepts zero value", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: 0,
      label: "Errors",
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing value", () => {
    const data = {
      type: "counter",
      version: "1.0",
      label: "Test",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing label", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: 42,
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "detail",
      version: "1.0",
      value: 42,
      label: "Test",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid color", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: 42,
      label: "Test",
      color: "purple",
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: 42,
      label: "Test",
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
