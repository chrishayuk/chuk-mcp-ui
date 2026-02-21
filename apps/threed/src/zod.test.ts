import { describe, it, expect } from "vitest";
import { threedSchema } from "./zod";

describe("threed zod schema validation", () => {
  it("accepts minimal valid scene", () => {
    const data = {
      type: "threed",
      version: "1.0",
      objects: [{ id: "box1", geometry: "box", position: [0, 0, 0] }],
    };
    expect(threedSchema.safeParse(data).success).toBe(true);
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
    expect(threedSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all geometry types", () => {
    const types = ["box", "sphere", "cylinder", "cone", "torus"] as const;
    for (const geometry of types) {
      const data = {
        type: "threed" as const,
        version: "1.0" as const,
        objects: [{ id: "obj", geometry, position: [0, 0, 0] as [number, number, number] }],
      };
      expect(threedSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts empty objects array", () => {
    const data = {
      type: "threed",
      version: "1.0",
      objects: [],
    };
    expect(threedSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing objects", () => {
    const data = {
      type: "threed",
      version: "1.0",
    };
    expect(threedSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      objects: [],
    };
    expect(threedSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid geometry", () => {
    const data = {
      type: "threed",
      version: "1.0",
      objects: [{ id: "obj", geometry: "pyramid", position: [0, 0, 0] }],
    };
    expect(threedSchema.safeParse(data).success).toBe(false);
  });

  it("rejects object missing position", () => {
    const data = {
      type: "threed",
      version: "1.0",
      objects: [{ id: "obj", geometry: "box" }],
    };
    expect(threedSchema.safeParse(data).success).toBe(false);
  });
});
