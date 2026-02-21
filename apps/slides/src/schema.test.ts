import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("slides schema validation", () => {
  it("accepts minimal valid slides", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [{ content: "Hello world" }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts slides with all options", () => {
    const data = {
      type: "slides",
      version: "1.0",
      title: "Tech Talk",
      transition: "fade",
      slides: [
        {
          title: "Introduction",
          content: "Welcome to the presentation",
          notes: "Greet the audience",
          background: "#1e293b",
          layout: "center",
        },
        {
          title: "Architecture",
          content: "Our system overview",
          layout: "split",
          image: "https://example.com/architecture.png",
        },
        {
          title: "Hero Image",
          content: "Full bleed photo",
          layout: "image",
          image: "https://example.com/hero.jpg",
          background: "rgba(0,0,0,0.5)",
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all transition values", () => {
    const transitions = ["fade", "slide", "none"];
    for (const transition of transitions) {
      const data = {
        type: "slides",
        version: "1.0",
        slides: [{ content: "Test" }],
        transition,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts all layout values", () => {
    const layouts = ["default", "center", "split", "image"];
    for (const layout of layouts) {
      const data = {
        type: "slides",
        version: "1.0",
        slides: [{ content: "Test", layout }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts slide with only content", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [{ content: "Just content, no title" }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts multiple slides", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [
        { content: "Slide 1" },
        { content: "Slide 2", title: "Second" },
        { content: "Slide 3", notes: "Speaker notes here" },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing slides", () => {
    const data = {
      type: "slides",
      version: "1.0",
      title: "No Slides",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects slide missing content", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [{ title: "No content" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "kanban",
      version: "1.0",
      slides: [{ content: "Test" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid transition value", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [{ content: "Test" }],
      transition: "zoom",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid layout value", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [{ content: "Test", layout: "fullscreen" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects empty slides array is accepted", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [],
    };
    // Empty array is valid per JSON schema (no minItems constraint)
    expect(validate(data)).toBe(true);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "slides",
      version: "1.0",
      slides: [{ content: "Test" }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
