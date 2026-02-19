import { describe, it, expect } from "vitest";
import { imageSchema } from "./zod";

describe("image zod schema validation", () => {
  it("accepts minimal valid input", () => {
    const data = {
      type: "image",
      version: "1.0",
      images: [{ id: "img-1", url: "https://example.com/photo.jpg" }],
    };
    expect(imageSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full input with all optional fields", () => {
    const data = {
      type: "image",
      version: "1.0",
      title: "Test Image",
      images: [
        {
          id: "img-1",
          url: "https://example.com/photo.jpg",
          alt: "A photo",
          caption: "Photo caption",
          width: 1200,
          height: 800,
        },
      ],
      activeIndex: 0,
      annotations: [
        {
          id: "ann-1",
          imageId: "img-1",
          type: "circle" as const,
          x: 100,
          y: 200,
          radius: 30,
          label: "Point of interest",
          color: "#ff0000",
          description: "Something notable",
        },
      ],
      controls: {
        zoom: true,
        fullscreen: true,
        thumbnails: false,
      },
    };
    expect(imageSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all annotation types", () => {
    const data = {
      type: "image",
      version: "1.0",
      images: [{ id: "img-1", url: "https://example.com/photo.jpg" }],
      annotations: [
        { id: "a1", imageId: "img-1", type: "circle" as const, x: 10, y: 20, radius: 15 },
        { id: "a2", imageId: "img-1", type: "rect" as const, x: 30, y: 40, width: 50, height: 60 },
        { id: "a3", imageId: "img-1", type: "point" as const, x: 70, y: 80, label: "Marker" },
        { id: "a4", imageId: "img-1", type: "text" as const, x: 90, y: 100, label: "Note" },
      ],
    };
    expect(imageSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing images", () => {
    const data = { type: "image", version: "1.0" };
    expect(imageSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      images: [{ id: "img-1", url: "https://example.com/photo.jpg" }],
    };
    expect(imageSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "video",
      version: "1.0",
      images: [{ id: "img-1", url: "https://example.com/photo.jpg" }],
    };
    expect(imageSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = {
      type: "image",
      version: "2.0",
      images: [{ id: "img-1", url: "https://example.com/photo.jpg" }],
    };
    expect(imageSchema.safeParse(data).success).toBe(false);
  });

  it("rejects image item missing id", () => {
    const data = {
      type: "image",
      version: "1.0",
      images: [{ url: "https://example.com/photo.jpg" }],
    };
    expect(imageSchema.safeParse(data).success).toBe(false);
  });

  it("rejects image item missing url", () => {
    const data = {
      type: "image",
      version: "1.0",
      images: [{ id: "img-1" }],
    };
    expect(imageSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid annotation type", () => {
    const data = {
      type: "image",
      version: "1.0",
      images: [{ id: "img-1", url: "https://example.com/photo.jpg" }],
      annotations: [
        { id: "a1", imageId: "img-1", type: "arrow", x: 10, y: 20 },
      ],
    };
    expect(imageSchema.safeParse(data).success).toBe(false);
  });

  it("accepts multiple images with activeIndex", () => {
    const data = {
      type: "image",
      version: "1.0",
      images: [
        { id: "img-1", url: "https://example.com/1.jpg" },
        { id: "img-2", url: "https://example.com/2.jpg" },
        { id: "img-3", url: "https://example.com/3.jpg" },
      ],
      activeIndex: 1,
    };
    expect(imageSchema.safeParse(data).success).toBe(true);
  });
});
