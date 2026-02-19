import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("embed schema validation", () => {
  it("accepts minimal valid input", () => {
    const data = { type: "embed", version: "1.0", url: "https://example.com" };
    expect(validate(data)).toBe(true);
  });

  it("accepts full input with all optional fields", () => {
    const data = {
      type: "embed",
      version: "1.0",
      title: "External Page",
      url: "https://example.com",
      sandbox: "allow-scripts",
      allow: "fullscreen",
      aspectRatio: "16/9",
      toolbar: true,
      fallbackText: "Could not load page.",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts input without toolbar", () => {
    const data = {
      type: "embed",
      version: "1.0",
      url: "https://example.com",
      toolbar: false,
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing url", () => {
    const data = { type: "embed", version: "1.0" };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = { version: "1.0", url: "https://example.com" };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = { type: "video", version: "1.0", url: "https://example.com" };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = { type: "embed", version: "2.0", url: "https://example.com" };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "embed",
      version: "1.0",
      url: "https://example.com",
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
