import { describe, it, expect } from "vitest";
import { gallerySchema } from "./zod";

describe("gallery zod schema validation", () => {
  it("accepts minimal valid gallery", () => {
    const data = {
      type: "gallery",
      version: "1.0",
      items: [{ id: "1", title: "Item One" }],
    };
    expect(gallerySchema.safeParse(data).success).toBe(true);
  });

  it("accepts full gallery with all optional fields", () => {
    const data = {
      type: "gallery",
      version: "1.0",
      title: "My Gallery",
      columns: 3,
      filterable: true,
      sortable: true,
      sortFields: ["Price", "Name"],
      emptyMessage: "Nothing here",
      items: [
        {
          id: "1",
          title: "Item One",
          subtitle: "Sub",
          description: "A description",
          image: { url: "https://example.com/img.jpg", alt: "Photo" },
          badges: [
            { label: "New" },
            { label: "Sale", variant: "secondary" },
            { label: "Hot", variant: "outline" },
          ],
          metadata: { Price: "$10", Category: "Books" },
          actions: [
            { label: "Buy", tool: "buy_item", arguments: { id: "1" } },
          ],
        },
      ],
    };
    expect(gallerySchema.safeParse(data).success).toBe(true);
  });

  it("accepts all badge variants", () => {
    const variants = ["default", "secondary", "outline"];
    for (const variant of variants) {
      const data = {
        type: "gallery",
        version: "1.0",
        items: [
          {
            id: "1",
            title: "Test",
            badges: [{ label: "Tag", variant }],
          },
        ],
      };
      expect(gallerySchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing items", () => {
    const data = {
      type: "gallery",
      version: "1.0",
    };
    expect(gallerySchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "detail",
      version: "1.0",
      items: [],
    };
    expect(gallerySchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "gallery",
      items: [{ id: "1", title: "Item" }],
    };
    expect(gallerySchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid column count", () => {
    const data = {
      type: "gallery",
      version: "1.0",
      columns: 5,
      items: [],
    };
    expect(gallerySchema.safeParse(data).success).toBe(false);
  });

  it("rejects item missing id", () => {
    const data = {
      type: "gallery",
      version: "1.0",
      items: [{ title: "No ID" }],
    };
    expect(gallerySchema.safeParse(data).success).toBe(false);
  });
});
