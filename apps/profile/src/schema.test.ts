import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("profile schema validation", () => {
  it("accepts minimal valid profile", () => {
    const data = {
      type: "profile",
      version: "1.0",
      points: [{ x: 0, y: 10 }, { x: 5, y: 20 }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts profile with all options", () => {
    const data = {
      type: "profile",
      version: "1.0",
      title: "Mountain Pass",
      points: [
        { x: 0, y: 1200 },
        { x: 5, y: 1800 },
        { x: 10, y: 2500 },
        { x: 15, y: 2000 },
        { x: 20, y: 1300 },
      ],
      xLabel: "Distance (km)",
      yLabel: "Elevation (m)",
      fill: true,
      color: "#4bc0c0",
      markers: [
        { x: 10, label: "Summit", color: "#ff6384", icon: "^" },
        { x: 5, label: "Rest Stop" },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts profile without markers", () => {
    const data = {
      type: "profile",
      version: "1.0",
      points: [{ x: 0, y: 0 }, { x: 100, y: 50 }],
      xLabel: "X",
      yLabel: "Y",
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing points", () => {
    const data = {
      type: "profile",
      version: "1.0",
      title: "No Points",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects point missing x", () => {
    const data = {
      type: "profile",
      version: "1.0",
      points: [{ y: 10 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects point missing y", () => {
    const data = {
      type: "profile",
      version: "1.0",
      points: [{ x: 5 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      points: [{ x: 0, y: 10 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects marker missing label", () => {
    const data = {
      type: "profile",
      version: "1.0",
      points: [{ x: 0, y: 10 }],
      markers: [{ x: 5 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects marker missing x", () => {
    const data = {
      type: "profile",
      version: "1.0",
      points: [{ x: 0, y: 10 }],
      markers: [{ label: "Test" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "profile",
      version: "1.0",
      points: [{ x: 0, y: 10 }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
