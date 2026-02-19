import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("gallery schema validation", () => {
  it("accepts minimal valid gallery", () => {
    const data = {
      type: "gallery",
      version: "1.0",
      items: [{ id: "1", title: "Item One" }],
    };
    expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
  });

  it("accepts gallery with empty items array", () => {
    const data = {
      type: "gallery",
      version: "1.0",
      items: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing items", () => {
    const data = {
      type: "gallery",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "detail",
      version: "1.0",
      items: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "gallery",
      items: [{ id: "1", title: "Item" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects item missing id", () => {
    const data = {
      type: "gallery",
      version: "1.0",
      items: [{ title: "No ID" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects item missing title", () => {
    const data = {
      type: "gallery",
      version: "1.0",
      items: [{ id: "1" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid column count", () => {
    const data = {
      type: "gallery",
      version: "1.0",
      columns: 5,
      items: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "gallery",
      version: "1.0",
      items: [{ id: "1", title: "Item" }],
      customField: "hello",
    };
    expect(validate(data)).toBe(true);
  });
});
