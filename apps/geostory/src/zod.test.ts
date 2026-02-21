import { describe, it, expect } from "vitest";
import { geostorySchema } from "./zod";

describe("geostory zod schema validation", () => {
  it("accepts minimal valid geostory", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [
        {
          id: "s1",
          title: "Start",
          text: "The journey begins.",
          location: { lat: 34.26, lon: 108.94 },
        },
      ],
    };
    expect(geostorySchema.safeParse(data).success).toBe(true);
  });

  it("accepts geostory with all options", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      title: "Silk Road Journey",
      basemap: "terrain" as const,
      steps: [
        {
          id: "s1",
          title: "Xi'an",
          text: "Ancient capital of China.",
          location: { lat: 34.26, lon: 108.94 },
          zoom: 10,
          image: "https://example.com/xian.jpg",
          marker: "star",
        },
        {
          id: "s2",
          title: "Samarkand",
          text: "Jewel of the Silk Road.",
          location: { lat: 39.65, lon: 66.96 },
        },
      ],
    };
    expect(geostorySchema.safeParse(data).success).toBe(true);
  });

  it("accepts all basemap values", () => {
    const basemaps = ["terrain", "satellite", "simple"] as const;
    for (const basemap of basemaps) {
      const data = {
        type: "geostory" as const,
        version: "1.0" as const,
        steps: [
          {
            id: "s1",
            title: "Step",
            text: "Text",
            location: { lat: 0, lon: 0 },
          },
        ],
        basemap,
      };
      expect(geostorySchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing steps", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      title: "No Steps",
    };
    expect(geostorySchema.safeParse(data).success).toBe(false);
  });

  it("rejects step missing id", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [
        { title: "Step", text: "Text", location: { lat: 0, lon: 0 } },
      ],
    };
    expect(geostorySchema.safeParse(data).success).toBe(false);
  });

  it("rejects step missing title", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [
        { id: "s1", text: "Text", location: { lat: 0, lon: 0 } },
      ],
    };
    expect(geostorySchema.safeParse(data).success).toBe(false);
  });

  it("rejects step missing text", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [
        { id: "s1", title: "Step", location: { lat: 0, lon: 0 } },
      ],
    };
    expect(geostorySchema.safeParse(data).success).toBe(false);
  });

  it("rejects step missing location", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [{ id: "s1", title: "Step", text: "Text" }],
    };
    expect(geostorySchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      steps: [
        {
          id: "s1",
          title: "Step",
          text: "Text",
          location: { lat: 0, lon: 0 },
        },
      ],
    };
    expect(geostorySchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid basemap value", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [
        {
          id: "s1",
          title: "Step",
          text: "Text",
          location: { lat: 0, lon: 0 },
        },
      ],
      basemap: "ocean",
    };
    expect(geostorySchema.safeParse(data).success).toBe(false);
  });

  it("rejects location with string lat", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [
        {
          id: "s1",
          title: "Step",
          text: "Text",
          location: { lat: "zero", lon: 0 },
        },
      ],
    };
    expect(geostorySchema.safeParse(data).success).toBe(false);
  });
});
