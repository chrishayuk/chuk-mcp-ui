import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("funnel schema validation", () => {
  it("accepts minimal valid funnel", () => {
    const data = {
      type: "funnel",
      version: "1.0",
      stages: [{ label: "Step 1", value: 100 }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts funnel with all options", () => {
    const data = {
      type: "funnel",
      version: "1.0",
      title: "Sales Funnel",
      stages: [
        {
          label: "Visitors",
          value: 10000,
          color: "#3b82f6",
          metadata: { source: "organic", period: "Q1" },
        },
        { label: "Leads", value: 5000, color: "#60a5fa" },
        { label: "Closed", value: 500, color: "#93c5fd" },
      ],
      showConversion: true,
      orientation: "vertical",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts funnel with multiple stages", () => {
    const data = {
      type: "funnel",
      version: "1.0",
      stages: [
        { label: "A", value: 1000 },
        { label: "B", value: 800 },
        { label: "C", value: 400 },
        { label: "D", value: 200 },
        { label: "E", value: 50 },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts horizontal orientation", () => {
    const data = {
      type: "funnel",
      version: "1.0",
      stages: [{ label: "Step", value: 100 }],
      orientation: "horizontal",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts stages with metadata", () => {
    const data = {
      type: "funnel",
      version: "1.0",
      stages: [
        {
          label: "Visitors",
          value: 10000,
          metadata: { source: "organic", campaign: "summer" },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing stages", () => {
    const data = {
      type: "funnel",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      stages: [{ label: "A", value: 100 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "funnel",
      stages: [{ label: "A", value: 100 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      stages: [{ label: "A", value: 100 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid orientation", () => {
    const data = {
      type: "funnel",
      version: "1.0",
      stages: [{ label: "A", value: 100 }],
      orientation: "diagonal",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects stage missing label", () => {
    const data = {
      type: "funnel",
      version: "1.0",
      stages: [{ value: 100 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects stage missing value", () => {
    const data = {
      type: "funnel",
      version: "1.0",
      stages: [{ label: "A" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "funnel",
      version: "1.0",
      stages: [{ label: "A", value: 100 }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
