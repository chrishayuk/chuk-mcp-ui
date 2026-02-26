import { describe, it, expect } from "vitest";
import { propagateState } from "../state-propagation";
import type { ComposeSection } from "../compose";
import type { CrossViewLink } from "@apps/dashboard/src/schema";

const sections: ComposeSection[] = [
  { id: "table", view: "datatable", data: { type: "datatable" } },
  { id: "map", view: "map", data: { type: "map" } },
  { id: "chart", view: "chart", data: { type: "chart" } },
];

describe("propagateState", () => {
  it("returns empty map when no initial state", () => {
    const result = propagateState(sections, undefined, undefined);
    expect(result.size).toBe(0);
  });

  it("returns empty map when initialState is provided but empty", () => {
    const result = propagateState(sections, [], {});
    expect(result.size).toBe(0);
  });

  it("seeds explicit selections", () => {
    const result = propagateState(sections, undefined, {
      selections: { table: ["row-1", "row-2"] },
    });
    expect(result.get("table")?.selectedIds).toEqual(["row-1", "row-2"]);
    expect(result.has("map")).toBe(false);
  });

  it("seeds explicit filters", () => {
    const result = propagateState(sections, undefined, {
      filters: { table: { status: "active" } },
    });
    expect(result.get("table")?.filters).toEqual({ status: "active" });
  });

  it("seeds explicit highlights", () => {
    const result = propagateState(sections, undefined, {
      highlights: { map: "feature-5" },
    });
    expect(result.get("map")?.highlightedId).toBe("feature-5");
  });

  it("propagates selection through link", () => {
    const links: CrossViewLink[] = [
      {
        source: "table",
        target: "map",
        type: "selection",
        sourceField: "id",
        targetField: "feature_id",
      },
    ];
    const result = propagateState(sections, links, {
      selections: { table: ["row-5"] },
    });
    expect(result.get("table")?.selectedIds).toEqual(["row-5"]);
    expect(result.get("map")?.selectedIds).toEqual(["row-5"]);
  });

  it("propagates filter through link with field mapping", () => {
    const links: CrossViewLink[] = [
      {
        source: "table",
        target: "chart",
        type: "filter",
        sourceField: "country",
        targetField: "region",
      },
    ];
    const result = propagateState(sections, links, {
      filters: { table: { country: "UK" } },
    });
    expect(result.get("table")?.filters).toEqual({ country: "UK" });
    expect(result.get("chart")?.filters).toEqual({ region: "UK" });
  });

  it("propagates highlight through link", () => {
    const links: CrossViewLink[] = [
      {
        source: "table",
        target: "map",
        type: "highlight",
        sourceField: "id",
        targetField: "feature_id",
      },
    ];
    const result = propagateState(sections, links, {
      highlights: { table: "row-3" },
    });
    expect(result.get("map")?.highlightedId).toBe("row-3");
  });

  it("handles bidirectional links", () => {
    const links: CrossViewLink[] = [
      {
        source: "table",
        target: "map",
        type: "selection",
        sourceField: "id",
        targetField: "feature_id",
        bidirectional: true,
      },
    ];
    const result = propagateState(sections, links, {
      selections: { map: ["feature-1"] },
    });
    // Map has explicit selection
    expect(result.get("map")?.selectedIds).toContain("feature-1");
    // Table gets propagated selection via reverse link
    expect(result.get("table")?.selectedIds).toContain("feature-1");
  });

  it("merges propagated selections with existing", () => {
    const links: CrossViewLink[] = [
      {
        source: "table",
        target: "map",
        type: "selection",
        sourceField: "id",
        targetField: "feature_id",
      },
    ];
    const result = propagateState(sections, links, {
      selections: {
        table: ["row-1"],
        map: ["feature-existing"],
      },
    });
    expect(result.get("map")?.selectedIds).toEqual(["feature-existing", "row-1"]);
  });

  it("ignores links to nonexistent panels", () => {
    const links: CrossViewLink[] = [
      {
        source: "table",
        target: "nonexistent",
        type: "selection",
        sourceField: "id",
        targetField: "id",
      },
    ];
    const result = propagateState(sections, links, {
      selections: { table: ["row-1"] },
    });
    expect(result.has("nonexistent")).toBe(false);
  });

  it("ignores unknown link types", () => {
    const links: CrossViewLink[] = [
      {
        source: "table",
        target: "map",
        type: "navigate" as CrossViewLink["type"],
        sourceField: "id",
        targetField: "id",
      },
    ];
    const result = propagateState(sections, links, {
      selections: { table: ["row-1"] },
    });
    // Table has its explicit state but map gets nothing propagated
    expect(result.get("table")?.selectedIds).toEqual(["row-1"]);
    expect(result.has("map")).toBe(false);
  });

  it("chains propagation across multiple links", () => {
    const links: CrossViewLink[] = [
      {
        source: "table",
        target: "map",
        type: "selection",
        sourceField: "id",
        targetField: "feature_id",
      },
      {
        source: "table",
        target: "chart",
        type: "filter",
        sourceField: "country",
        targetField: "region",
      },
    ];
    const result = propagateState(sections, links, {
      selections: { table: ["row-1"] },
      filters: { table: { country: "FR" } },
    });
    expect(result.get("map")?.selectedIds).toEqual(["row-1"]);
    expect(result.get("chart")?.filters).toEqual({ region: "FR" });
  });
});
