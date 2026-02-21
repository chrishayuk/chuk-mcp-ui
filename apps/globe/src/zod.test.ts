import { describe, it, expect } from "vitest";
import { globeSchema } from "./zod";

describe("globe zod schema validation", () => {
  it("accepts minimal valid globe", () => {
    const data = {
      type: "globe",
      version: "1.0",
      points: [{ id: "nyc", lat: 40.7128, lon: -74.006, label: "New York" }],
    };
    expect(globeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts globe with all options", () => {
    const data = {
      type: "globe",
      version: "1.0",
      title: "World Cities",
      points: [
        { id: "nyc", lat: 40.7128, lon: -74.006, label: "New York", color: "#ff0000", size: 8 },
        { id: "lon", lat: 51.5074, lon: -0.1278, label: "London", color: "#0000ff", size: 6 },
      ],
      arcs: [
        { from: "nyc", to: "lon", color: "#ffcc00", label: "Transatlantic" },
      ],
      rotation: { lat: 30, lon: -40 },
    };
    expect(globeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts globe with arcs only", () => {
    const data = {
      type: "globe",
      version: "1.0",
      points: [
        { id: "a", lat: 0, lon: 0, label: "A" },
        { id: "b", lat: 10, lon: 20, label: "B" },
      ],
      arcs: [{ from: "a", to: "b" }],
    };
    expect(globeSchema.safeParse(data).success).toBe(true);
  });

  it("accepts negative coordinates", () => {
    const data = {
      type: "globe",
      version: "1.0",
      points: [{ id: "sp", lat: -23.55, lon: -46.63, label: "Sao Paulo" }],
    };
    expect(globeSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing points", () => {
    const data = {
      type: "globe",
      version: "1.0",
    };
    expect(globeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "map",
      version: "1.0",
      points: [],
    };
    expect(globeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects point missing lat", () => {
    const data = {
      type: "globe",
      version: "1.0",
      points: [{ id: "a", lon: 0, label: "A" }],
    };
    expect(globeSchema.safeParse(data).success).toBe(false);
  });

  it("rejects point missing label", () => {
    const data = {
      type: "globe",
      version: "1.0",
      points: [{ id: "a", lat: 0, lon: 0 }],
    };
    expect(globeSchema.safeParse(data).success).toBe(false);
  });
});
