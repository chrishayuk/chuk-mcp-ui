import { describe, it, expect } from "vitest";
import { carouselSchema } from "./zod";

describe("carousel zod schema validation", () => {
  it("accepts minimal valid carousel", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      items: [{ id: "slide-1" }],
    };
    expect(carouselSchema.safeParse(data).success).toBe(true);
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
    expect(carouselSchema.safeParse(data).success).toBe(true);
  });

  it("accepts both transition types", () => {
    const transitions = ["slide", "fade"] as const;
    for (const transition of transitions) {
      const data = {
        type: "carousel" as const,
        version: "1.0" as const,
        items: [{ id: "s1" }],
        transition,
      };
      expect(carouselSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing items", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      title: "Gallery",
    };
    expect(carouselSchema.safeParse(data).success).toBe(false);
  });

  it("rejects item missing id", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      items: [{ title: "No ID" }],
    };
    expect(carouselSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "slider",
      version: "1.0",
      items: [{ id: "s1" }],
    };
    expect(carouselSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid transition value", () => {
    const data = {
      type: "carousel",
      version: "1.0",
      items: [{ id: "s1" }],
      transition: "zoom",
    };
    expect(carouselSchema.safeParse(data).success).toBe(false);
  });
});
