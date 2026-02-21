import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("geostory schema validation", () => {
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
    expect(validate(data)).toBe(true);
  });

  it("accepts geostory with all options", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      title: "Silk Road Journey",
      basemap: "terrain",
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
    expect(validate(data)).toBe(true);
  });

  it("accepts all basemap values", () => {
    for (const basemap of ["terrain", "satellite", "simple"]) {
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
        basemap,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing steps", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      title: "No Steps",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects step missing id", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [
        { title: "Step", text: "Text", location: { lat: 0, lon: 0 } },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects step missing title", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [
        { id: "s1", text: "Text", location: { lat: 0, lon: 0 } },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects step missing text", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [
        { id: "s1", title: "Step", location: { lat: 0, lon: 0 } },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects step missing location", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [{ id: "s1", title: "Step", text: "Text" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects location missing lat", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [
        { id: "s1", title: "Step", text: "Text", location: { lon: 0 } },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects location missing lon", () => {
    const data = {
      type: "geostory",
      version: "1.0",
      steps: [
        { id: "s1", title: "Step", text: "Text", location: { lat: 0 } },
      ],
    };
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
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
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
