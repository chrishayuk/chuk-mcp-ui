import { describe, it, expect } from "vitest";
import { embedSchema } from "./zod";

describe("embed zod schema validation", () => {
  it("accepts minimal valid input", () => {
    const data = { type: "embed", version: "1.0", url: "https://example.com" };
    expect(embedSchema.safeParse(data).success).toBe(true);
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
    expect(embedSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing url", () => {
    const data = { type: "embed", version: "1.0" };
    expect(embedSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = { version: "1.0", url: "https://example.com" };
    expect(embedSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = { type: "video", version: "1.0", url: "https://example.com" };
    expect(embedSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = { type: "embed", version: "2.0", url: "https://example.com" };
    expect(embedSchema.safeParse(data).success).toBe(false);
  });
});
