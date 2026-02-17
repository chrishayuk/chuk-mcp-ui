import { describe, it, expect } from "vitest";
import { resolveTemplates } from "./actions";

describe("resolveTemplates", () => {
  it("resolves simple top-level keys", () => {
    const result = resolveTemplates(
      { id: "{id}", name: "{name}" },
      { id: "123", name: "Roman Villa" }
    );
    expect(result).toEqual({ id: "123", name: "Roman Villa" });
  });

  it("resolves nested dot-notation paths", () => {
    const result = resolveTemplates(
      { nhle_id: "{properties.id}" },
      { properties: { id: "1234567" } }
    );
    expect(result).toEqual({ nhle_id: "1234567" });
  });

  it("resolves deeply nested paths", () => {
    const result = resolveTemplates(
      { value: "{a.b.c.d}" },
      { a: { b: { c: { d: "deep" } } } }
    );
    expect(result).toEqual({ value: "deep" });
  });

  it("returns empty string for missing values", () => {
    const result = resolveTemplates(
      { missing: "{nonexistent}" },
      { id: "123" }
    );
    expect(result).toEqual({ missing: "" });
  });

  it("returns empty string for partially missing nested paths", () => {
    const result = resolveTemplates(
      { missing: "{a.b.c}" },
      { a: { x: 1 } }
    );
    expect(result).toEqual({ missing: "" });
  });

  it("handles null values in path", () => {
    const result = resolveTemplates(
      { val: "{a.b}" },
      { a: null } as unknown as Record<string, unknown>
    );
    expect(result).toEqual({ val: "" });
  });

  it("handles numeric values", () => {
    const result = resolveTemplates(
      { lat: "{lat}", lon: "{lon}" },
      { lat: 51.505, lon: -0.09 }
    );
    expect(result).toEqual({ lat: "51.505", lon: "-0.09" });
  });

  it("handles boolean values", () => {
    const result = resolveTemplates(
      { active: "{active}" },
      { active: true }
    );
    expect(result).toEqual({ active: "true" });
  });

  it("preserves literal text around templates", () => {
    const result = resolveTemplates(
      { url: "https://example.com/{id}/detail" },
      { id: "abc" }
    );
    expect(result).toEqual({ url: "https://example.com/abc/detail" });
  });

  it("resolves multiple templates in a single string", () => {
    const result = resolveTemplates(
      { label: "{first} {last}" },
      { first: "John", last: "Doe" }
    );
    expect(result).toEqual({ label: "John Doe" });
  });

  it("handles empty templates object", () => {
    const result = resolveTemplates({}, { id: "123" });
    expect(result).toEqual({});
  });

  it("handles strings without template markers", () => {
    const result = resolveTemplates(
      { literal: "no templates here" },
      { id: "123" }
    );
    expect(result).toEqual({ literal: "no templates here" });
  });
});
