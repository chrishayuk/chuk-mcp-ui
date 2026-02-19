import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("carousel schema validation", () => {
  it("accepts minimal valid carousel", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      items: [{ id: "slide-1" }],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts carousel with all options", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      title: "Product Gallery",
      items: [
        {
          id: "slide-1",
          image: { url: "https://example.com/img1.jpg", alt: "Product 1" },
          title: "First Product",
          description: "A great product",
          action: { label: "View", tool: "open_product", arguments: { id: "p1" } },
        },
        {
          id: "slide-2",
          image: { url: "https://example.com/img2.jpg" },
          title: "Second Product",
        },
      ],
      autoPlay: true,
      autoPlayInterval: 3000,
      showDots: true,
      showArrows: true,
      loop: false,
      transition: "fade",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts both transition types", () => {
    for (const transition of ["slide", "fade"]) {
      const data = {
        type: "carousel",
        version: "1.0",
        items: [{ id: "s1" }],
        transition,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing items", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      title: "Gallery",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects item missing id", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      items: [{ title: "No ID" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "slider",
      version: "1.0",
      items: [{ id: "s1" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid transition value", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      items: [{ id: "s1" }],
      transition: "zoom",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects image missing url", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      items: [{ id: "s1", image: { alt: "missing url" } }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects action missing required fields", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      items: [{ id: "s1", action: { label: "Click" } }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      items: [{ id: "s1" }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
