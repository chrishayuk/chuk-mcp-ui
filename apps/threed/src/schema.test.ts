import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("threed schema validation", () => {
  it("accepts minimal valid scene", () => {
    const data = {
      type: "threed",
      version: "1.0",
      objects: [{ id: "box1", geometry: "box", position: [0, 0, 0] }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts scene with all options", () => {
    const data = {
      type: "threed",
      version: "1.0",
      title: "My Scene",
      background: "#1a1a2e",
      objects: [
        {
          id: "box1",
          geometry: "box",
          position: [0, 0, 0],
          scale: [2, 1, 1],
          color: "#ff0000",
          label: "Red Box",
          wireframe: false,
        },
        {
          id: "sphere1",
          geometry: "sphere",
          position: [3, 0, 0],
          color: "#00ff00",
          wireframe: true,
        },
      ],
      camera: {
        position: [5, 5, 5],
        target: [0, 0, 0],
      },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all geometry types", () => {
    const types = ["box", "sphere", "cylinder", "cone", "torus"];
    for (const geometry of types) {
      const data = {
        type: "threed",
        version: "1.0",
        objects: [{ id: "obj", geometry, position: [0, 0, 0] }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts empty objects array", () => {
    const data = {
      type: "threed",
      version: "1.0",
      objects: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts scene with camera only", () => {
    const data = {
      type: "threed",
      version: "1.0",
      objects: [],
      camera: { position: [10, 10, 10] },
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing objects", () => {
    const data = {
      type: "threed",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      objects: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid geometry", () => {
    const data = {
      type: "threed",
      version: "1.0",
      objects: [{ id: "obj", geometry: "pyramid", position: [0, 0, 0] }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects object missing position", () => {
    const data = {
      type: "threed",
      version: "1.0",
      objects: [{ id: "obj", geometry: "box" }],
    };
    expect(validate(data)).toBe(false);
  });
});
