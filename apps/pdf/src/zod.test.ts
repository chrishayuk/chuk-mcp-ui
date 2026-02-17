import { describe, it, expect } from "vitest";
import { pdfSchema } from "./zod";

describe("pdf zod schema validation", () => {
  it("accepts minimal valid input", () => {
    const data = { type: "pdf", version: "1.0", url: "https://example.com/doc.pdf" };
    expect(pdfSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full input with all optional fields", () => {
    const data = {
      type: "pdf",
      version: "1.0",
      url: "https://example.com/doc.pdf",
      initialPage: 3,
      title: "Research Paper",
    };
    expect(pdfSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing url", () => {
    const data = { type: "pdf", version: "1.0" };
    expect(pdfSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = { version: "1.0", url: "https://example.com/doc.pdf" };
    expect(pdfSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = { type: "chart", version: "1.0", url: "https://example.com/doc.pdf" };
    expect(pdfSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = { type: "pdf", version: "2.0", url: "https://example.com/doc.pdf" };
    expect(pdfSchema.safeParse(data).success).toBe(false);
  });

  it("rejects initialPage less than 1", () => {
    const data = { type: "pdf", version: "1.0", url: "https://example.com/doc.pdf", initialPage: 0 };
    expect(pdfSchema.safeParse(data).success).toBe(false);
  });

  it("accepts data URI url", () => {
    const data = { type: "pdf", version: "1.0", url: "data:application/pdf;base64,JVBERi0=" };
    expect(pdfSchema.safeParse(data).success).toBe(true);
  });
});
