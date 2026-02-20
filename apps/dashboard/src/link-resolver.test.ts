import { describe, it, expect } from "vitest";
import { buildLinkFilter } from "./link-resolver";
import type { CrossViewLink } from "./schema";
import type { ViewMessage } from "@chuk/view-shared";

function link(
  source: string,
  target: string,
  type: CrossViewLink["type"],
  bidirectional = false,
): CrossViewLink {
  return { source, target, type, sourceField: "x", targetField: "y", bidirectional };
}

function msg(type: string): ViewMessage {
  return { type, source: "test" } as ViewMessage;
}

describe("buildLinkFilter", () => {
  it("returns undefined when links is undefined", () => {
    expect(buildLinkFilter(undefined)).toBeUndefined();
  });

  it("returns undefined when links is empty", () => {
    expect(buildLinkFilter([])).toBeUndefined();
  });

  it("allows matching message type on declared route", () => {
    const filter = buildLinkFilter([link("a", "b", "selection")]);
    expect(filter).toBeDefined();
    expect(filter!(msg("select"), "a", "b")).toBe(true);
  });

  it("blocks non-matching message type", () => {
    const filter = buildLinkFilter([link("a", "b", "selection")]);
    expect(filter!(msg("filter"), "a", "b")).toBe(false);
  });

  it("blocks undeclared source-target pair", () => {
    const filter = buildLinkFilter([link("a", "b", "selection")]);
    expect(filter!(msg("select"), "a", "c")).toBe(false);
  });

  it("blocks reverse direction when not bidirectional", () => {
    const filter = buildLinkFilter([link("a", "b", "selection", false)]);
    expect(filter!(msg("select"), "b", "a")).toBe(false);
  });

  it("allows reverse direction when bidirectional", () => {
    const filter = buildLinkFilter([link("a", "b", "selection", true)]);
    expect(filter!(msg("select"), "b", "a")).toBe(true);
  });

  it("handles multiple links", () => {
    const filter = buildLinkFilter([
      link("a", "b", "selection"),
      link("b", "c", "filter"),
    ]);
    expect(filter!(msg("select"), "a", "b")).toBe(true);
    expect(filter!(msg("filter"), "b", "c")).toBe(true);
    expect(filter!(msg("select"), "b", "c")).toBe(false);
    expect(filter!(msg("filter"), "a", "b")).toBe(false);
  });

  it("maps all link types to bus message types", () => {
    const pairs: [CrossViewLink["type"], string][] = [
      ["selection", "select"],
      ["filter", "filter"],
      ["highlight", "highlight"],
      ["navigate", "navigate"],
      ["update", "update"],
    ];
    for (const [linkType, busType] of pairs) {
      const filter = buildLinkFilter([link("a", "b", linkType)]);
      expect(filter!(msg(busType), "a", "b")).toBe(true);
    }
  });

  it("blocks unknown source panel", () => {
    const filter = buildLinkFilter([link("a", "b", "selection")]);
    expect(filter!(msg("select"), "unknown", "b")).toBe(false);
  });
});
