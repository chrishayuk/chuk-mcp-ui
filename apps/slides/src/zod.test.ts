import { describe, it, expect } from "vitest";
import { slidesSchema } from "./zod";

describe("slides zod schema validation", () => {
  it("accepts minimal valid slides", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [{ content: "Hello world" }],
    };
    expect(slidesSchema.safeParse(data).success).toBe(true);
  });

  it("accepts slides with all options", () => {
    const data = {
      type: "slides" as const,
      version: "1.0" as const,
      title: "Tech Talk",
      transition: "fade" as const,
      slides: [
        {
          title: "Introduction",
          content: "Welcome to the presentation",
          notes: "Greet the audience",
          background: "#1e293b",
          layout: "center" as const,
        },
        {
          title: "Architecture",
          content: "Our system overview",
          layout: "split" as const,
          image: "https://example.com/architecture.png",
        },
      ],
    };
    expect(slidesSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all transition values", () => {
    const transitions = ["fade", "slide", "none"] as const;
    for (const transition of transitions) {
      const data = {
        type: "slides" as const,
        version: "1.0" as const,
        slides: [{ content: "Test" }],
        transition,
      };
      expect(slidesSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts all layout values", () => {
    const layouts = ["default", "center", "split", "image"] as const;
    for (const layout of layouts) {
      const data = {
        type: "slides" as const,
        version: "1.0" as const,
        slides: [{ content: "Test", layout }],
      };
      expect(slidesSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing slides", () => {
    const data = {
      type: "slides",
      version: "1.0",
      title: "No Slides",
    };
    expect(slidesSchema.safeParse(data).success).toBe(false);
  });

  it("rejects slide missing content", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [{ title: "No content" }],
    };
    expect(slidesSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      slides: [{ content: "Test" }],
    };
    expect(slidesSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid transition value", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [{ content: "Test" }],
      transition: "zoom",
    };
    expect(slidesSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid layout value", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [{ content: "Test", layout: "fullscreen" }],
    };
    expect(slidesSchema.safeParse(data).success).toBe(false);
  });

  it("accepts slide with only content", () => {
    const data = {
      type: "slides" as const,
      version: "1.0" as const,
      slides: [{ content: "Just content" }],
    };
    expect(slidesSchema.safeParse(data).success).toBe(true);
  });
});
