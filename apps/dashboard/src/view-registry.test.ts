import { describe, it, expect } from "vitest";
import { resolveViewUrl, BUILT_IN_VIEWS, CDN_BASE } from "./view-registry";

describe("resolveViewUrl", () => {
  it("returns viewUrl when provided", () => {
    expect(resolveViewUrl({ viewUrl: "https://custom.com/v" })).toBe("https://custom.com/v");
  });

  it("prefers viewUrl over viewType", () => {
    expect(resolveViewUrl({ viewUrl: "https://custom.com/v", viewType: "map" })).toBe("https://custom.com/v");
  });

  it("resolves known viewType from built-in registry", () => {
    expect(resolveViewUrl({ viewType: "map" })).toBe(`${CDN_BASE}/map/v1`);
  });

  it("resolves all built-in viewTypes", () => {
    for (const [viewType, url] of Object.entries(BUILT_IN_VIEWS)) {
      expect(resolveViewUrl({ viewType })).toBe(url);
    }
  });

  it("falls back to CDN pattern for unknown viewType", () => {
    expect(resolveViewUrl({ viewType: "custom-widget" })).toBe(`${CDN_BASE}/custom-widget/v1`);
  });

  it("uses custom registry over built-in", () => {
    const custom = { map: "https://my-cdn.com/map/v2" };
    expect(resolveViewUrl({ viewType: "map" }, custom)).toBe("https://my-cdn.com/map/v2");
  });

  it("falls back to built-in when custom registry does not have the type", () => {
    const custom = { chart: "https://my-cdn.com/chart/v2" };
    expect(resolveViewUrl({ viewType: "map" }, custom)).toBe(`${CDN_BASE}/map/v1`);
  });

  it("throws when neither viewUrl nor viewType provided", () => {
    expect(() => resolveViewUrl({})).toThrow("Panel must have either viewUrl or viewType");
  });

  it("throws when both are undefined", () => {
    expect(() => resolveViewUrl({ viewUrl: undefined, viewType: undefined })).toThrow();
  });

  it("CDN_BASE has no trailing slash", () => {
    expect(CDN_BASE.endsWith("/")).toBe(false);
  });
});
