import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("compare schema validation", () => {
  it("accepts minimal valid compare", () => {
    const data = {
      type: "compare",
      version: "1.0",
      before: { url: "https://example.com/before.jpg" },
      after: { url: "https://example.com/after.jpg" },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts full compare with all optional fields", () => {
    const data = {
      type: "compare",
      version: "1.0",
      title: "Photo Restoration",
      before: {
        url: "https://example.com/before.jpg",
        alt: "Before image",
        caption: "Original photo",
      },
      after: {
        url: "https://example.com/after.jpg",
        alt: "After image",
        caption: "Restored photo",
      },
      orientation: "horizontal",
      initialPosition: 50,
      labels: {
        before: "Before",
        after: "After",
      },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts vertical orientation", () => {
    const data = {
      type: "compare",
      version: "1.0",
      before: { url: "https://example.com/before.jpg" },
      after: { url: "https://example.com/after.jpg" },
      orientation: "vertical",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts initialPosition at boundaries", () => {
    for (const pos of [0, 50, 100]) {
      const data = {
        type: "compare",
        version: "1.0",
        before: { url: "https://example.com/before.jpg" },
        after: { url: "https://example.com/after.jpg" },
        initialPosition: pos,
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects initialPosition out of range", () => {
    const data = {
      type: "compare",
      version: "1.0",
      before: { url: "https://example.com/before.jpg" },
      after: { url: "https://example.com/after.jpg" },
      initialPosition: 150,
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects negative initialPosition", () => {
    const data = {
      type: "compare",
      version: "1.0",
      before: { url: "https://example.com/before.jpg" },
      after: { url: "https://example.com/after.jpg" },
      initialPosition: -10,
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing before", () => {
    const data = {
      type: "compare",
      version: "1.0",
      after: { url: "https://example.com/after.jpg" },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing after", () => {
    const data = {
      type: "compare",
      version: "1.0",
      before: { url: "https://example.com/before.jpg" },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "detail",
      version: "1.0",
      before: { url: "https://example.com/before.jpg" },
      after: { url: "https://example.com/after.jpg" },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "compare",
      before: { url: "https://example.com/before.jpg" },
      after: { url: "https://example.com/after.jpg" },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid orientation", () => {
    const data = {
      type: "compare",
      version: "1.0",
      before: { url: "https://example.com/before.jpg" },
      after: { url: "https://example.com/after.jpg" },
      orientation: "diagonal",
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts labels with only before", () => {
    const data = {
      type: "compare",
      version: "1.0",
      before: { url: "https://example.com/before.jpg" },
      after: { url: "https://example.com/after.jpg" },
      labels: { before: "Original" },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts labels with only after", () => {
    const data = {
      type: "compare",
      version: "1.0",
      before: { url: "https://example.com/before.jpg" },
      after: { url: "https://example.com/after.jpg" },
      labels: { after: "Enhanced" },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "compare",
      version: "1.0",
      before: { url: "https://example.com/before.jpg" },
      after: { url: "https://example.com/after.jpg" },
      customField: "hello",
    };
    expect(validate(data)).toBe(true);
  });
});
