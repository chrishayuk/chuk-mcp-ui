import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("gauge schema validation", () => {
  it("accepts minimal valid gauge", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      value: 50,
    };
    expect(validate(data)).toBe(true);
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
      format: "number",
      size: "lg",
      subtitle: "Current speed",
    };
    expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
  });

  it("accepts all size options", () => {
    const sizes = ["sm", "md", "lg"];
    for (const size of sizes) {
      const data = {
        type: "gauge",
        version: "1.0",
        value: 50,
        size,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts all format options", () => {
    const formats = ["number", "percent"];
    for (const format of formats) {
      const data = {
        type: "gauge",
        version: "1.0",
        value: 50,
        format,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts negative min value", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      value: 23.5,
      min: -10,
      max: 50,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts decimal value", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      value: 23.5,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts zero value", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      value: 0,
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing value", () => {
    const data = {
      type: "gauge",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      value: 50,
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "gauge",
      value: 50,
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "counter",
      version: "1.0",
      value: 50,
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid size", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      value: 50,
      size: "xl",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid format", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      value: 50,
      format: "currency",
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "gauge",
      version: "1.0",
      value: 50,
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
