import { describe, it, expect } from "vitest";
import { annotationContentSchema } from "./zod";

describe("annotation zod schema validation", () => {
  it("accepts minimal valid input", () => {
    const data = {
      type: "annotation",
      version: "1.0",
      imageUrl: "https://example.com/photo.jpg",
      annotations: [],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full input with all optional fields", () => {
    const data = {
      type: "annotation",
      version: "1.0",
      title: "Full Annotation",
      imageUrl: "https://example.com/photo.jpg",
      imageWidth: 800,
      imageHeight: 600,
      annotations: [
        {
          kind: "circle" as const,
          id: "c1",
          cx: 100,
          cy: 200,
          r: 30,
          color: "#ff0000",
          label: "Region A",
          strokeWidth: 3,
        },
        {
          kind: "rect" as const,
          id: "r1",
          x: 300,
          y: 100,
          width: 150,
          height: 80,
          color: "#00ff00",
          label: "Zone B",
          strokeWidth: 2,
        },
        {
          kind: "arrow" as const,
          id: "a1",
          x1: 50,
          y1: 50,
          x2: 200,
          y2: 200,
          color: "#0000ff",
          label: "Direction",
          strokeWidth: 2,
        },
        {
          kind: "text" as const,
          id: "t1",
          x: 400,
          y: 300,
          text: "Important note",
          color: "#ff00ff",
          fontSize: 18,
        },
      ],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(true);
  });

  it("accepts a circle annotation", () => {
    const data = {
      type: "annotation",
      version: "1.0",
      imageUrl: "https://example.com/photo.jpg",
      annotations: [
        { kind: "circle" as const, id: "c1", cx: 100, cy: 200, r: 30 },
      ],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(true);
  });

  it("accepts a rect annotation", () => {
    const data = {
      type: "annotation",
      version: "1.0",
      imageUrl: "https://example.com/photo.jpg",
      annotations: [
        { kind: "rect" as const, id: "r1", x: 10, y: 20, width: 100, height: 50 },
      ],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(true);
  });

  it("accepts an arrow annotation", () => {
    const data = {
      type: "annotation",
      version: "1.0",
      imageUrl: "https://example.com/photo.jpg",
      annotations: [
        { kind: "arrow" as const, id: "a1", x1: 10, y1: 20, x2: 100, y2: 200 },
      ],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(true);
  });

  it("accepts a text annotation", () => {
    const data = {
      type: "annotation",
      version: "1.0",
      imageUrl: "https://example.com/photo.jpg",
      annotations: [
        { kind: "text" as const, id: "t1", x: 50, y: 60, text: "Hello" },
      ],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing imageUrl", () => {
    const data = {
      type: "annotation",
      version: "1.0",
      annotations: [],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing annotations", () => {
    const data = {
      type: "annotation",
      version: "1.0",
      imageUrl: "https://example.com/photo.jpg",
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      imageUrl: "https://example.com/photo.jpg",
      annotations: [],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "image",
      version: "1.0",
      imageUrl: "https://example.com/photo.jpg",
      annotations: [],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = {
      type: "annotation",
      version: "2.0",
      imageUrl: "https://example.com/photo.jpg",
      annotations: [],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(false);
  });

  it("rejects circle annotation missing required fields", () => {
    const data = {
      type: "annotation",
      version: "1.0",
      imageUrl: "https://example.com/photo.jpg",
      annotations: [
        { kind: "circle" as const, id: "c1", cx: 100 },
      ],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(false);
  });

  it("rejects rect annotation missing required fields", () => {
    const data = {
      type: "annotation",
      version: "1.0",
      imageUrl: "https://example.com/photo.jpg",
      annotations: [
        { kind: "rect" as const, id: "r1", x: 10, y: 20 },
      ],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(false);
  });

  it("rejects unknown annotation kind", () => {
    const data = {
      type: "annotation",
      version: "1.0",
      imageUrl: "https://example.com/photo.jpg",
      annotations: [
        { kind: "polygon", id: "p1", points: "10,20 30,40" },
      ],
    };
    expect(annotationContentSchema.safeParse(data).success).toBe(false);
  });
});
