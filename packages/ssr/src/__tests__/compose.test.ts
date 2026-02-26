import { describe, it, expect, vi } from "vitest";
import { layoutToContainerStyle, panelStyle } from "../layout-css";
import type { ResolvedLayout } from "@apps/dashboard/src/auto-layout";

// Mock the ssr-entry render function so we don't need all 65 renderers
vi.mock("../ssr-entry", () => ({
  render: vi.fn((view: string, data: unknown) => {
    const d = data as Record<string, unknown>;
    return `<div data-view="${view}">${d.title ?? view}</div>`;
  }),
  views: ["counter", "json", "datatable", "map", "markdown"],
}));

// Import compose AFTER the mock is set up
const { compose, infer } = await import("../compose");

// ── layoutToContainerStyle ──────────────────────────────────────────

describe("layoutToContainerStyle", () => {
  it("produces grid CSS with columns", () => {
    const layout: ResolvedLayout = {
      display: "grid",
      gridTemplateColumns: "3fr 2fr",
      panelStyles: new Map(),
    };
    const css = layoutToContainerStyle(layout);
    expect(css).toContain("display:grid");
    expect(css).toContain("grid-template-columns:3fr 2fr");
    expect(css).toContain("gap:12px");
  });

  it("produces grid CSS with rows and areas", () => {
    const layout: ResolvedLayout = {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "auto 1fr",
      gridTemplateAreas: '"header header" "left right"',
      panelStyles: new Map(),
    };
    const css = layoutToContainerStyle(layout);
    expect(css).toContain("grid-template-rows:auto 1fr");
    expect(css).toContain("grid-template-areas:");
  });

  it("produces flex CSS with direction", () => {
    const layout: ResolvedLayout = {
      display: "flex",
      direction: "column",
      panelStyles: new Map(),
    };
    const css = layoutToContainerStyle(layout);
    expect(css).toContain("display:flex");
    expect(css).toContain("flex-direction:column");
  });

  it("defaults flex direction to row", () => {
    const layout: ResolvedLayout = {
      display: "flex",
      panelStyles: new Map(),
    };
    const css = layoutToContainerStyle(layout);
    expect(css).toContain("flex-direction:row");
  });

  it("uses custom gap", () => {
    const layout: ResolvedLayout = {
      display: "flex",
      panelStyles: new Map(),
    };
    const css = layoutToContainerStyle(layout, "24px");
    expect(css).toContain("gap:24px");
  });

  it("includes width and height 100%", () => {
    const layout: ResolvedLayout = {
      display: "grid",
      gridTemplateColumns: "1fr",
      panelStyles: new Map(),
    };
    const css = layoutToContainerStyle(layout);
    expect(css).toContain("width:100%");
    expect(css).toContain("height:100%");
  });
});

// ── panelStyle ──────────────────────────────────────────────────────

describe("panelStyle", () => {
  it("returns per-panel grid CSS when panelStyles has entries", () => {
    const styles = new Map<string, React.CSSProperties>();
    styles.set("hero", { gridRow: "1 / -1", gridColumn: "1" });

    const layout: ResolvedLayout = {
      display: "grid",
      gridTemplateColumns: "3fr 2fr",
      panelStyles: styles,
    };

    const css = panelStyle(layout, "hero");
    expect(css).toContain("grid-row:1 / -1");
    expect(css).toContain("grid-column:1");
    expect(css).toContain("overflow:auto");
  });

  it("returns default grid style when panel not in map", () => {
    const layout: ResolvedLayout = {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      panelStyles: new Map(),
    };
    const css = panelStyle(layout, "unknown");
    expect(css).toBe("overflow:auto");
  });

  it("returns flex:1 for flex layouts when panel not in map", () => {
    const layout: ResolvedLayout = {
      display: "flex",
      direction: "row",
      panelStyles: new Map(),
    };
    const css = panelStyle(layout, "panel1");
    expect(css).toContain("flex:1");
    expect(css).toContain("min-width:0");
  });
});

// ── compose ─────────────────────────────────────────────────────────

describe("compose", () => {
  it("renders explicit view names", () => {
    const result = compose({
      sections: [
        { id: "a", view: "counter", data: { type: "counter", version: "1.0", value: 42, label: "Users" } },
        { id: "b", view: "markdown", data: { type: "markdown", version: "1.0", content: "# Hello" } },
      ],
      layout: "grid",
    });

    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.html).toContain('data-panel="a"');
    expect(result.html).toContain('data-panel="b"');
    expect(result.html).toContain('data-view="counter"');
    expect(result.html).toContain('data-view="markdown"');
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0]).toEqual({ id: "a", view: "counter", inferred: false });
    expect(result.sections[1]).toEqual({ id: "b", view: "markdown", inferred: false });
  });

  it("auto-infers views from data shapes", () => {
    const result = compose({
      sections: [
        {
          id: "geo",
          data: {
            type: "FeatureCollection",
            features: [
              { type: "Feature", geometry: { type: "Point", coordinates: [0, 0] }, properties: {} },
            ],
          },
        },
      ],
    });

    expect(result.sections[0].inferred).toBe(true);
    expect(result.sections[0].view).toBe("map");
    expect(result.sections[0].confidence).toBeGreaterThan(0);
    expect(result.sections[0].reason).toBeDefined();
  });

  it("infers counter for a single number", () => {
    const result = compose({
      sections: [
        { id: "x", data: 42 },
      ],
    });

    // inferView recognises a bare number as a counter value
    expect(result.sections[0].view).toBe("counter");
    expect(result.sections[0].inferred).toBe(true);
    expect(result.sections[0].confidence).toBeGreaterThan(0);
  });

  it("renders single section full-width", () => {
    const result = compose({
      sections: [
        { id: "only", view: "counter", data: { type: "counter", version: "1.0", value: 1 } },
      ],
    });

    expect(result.html).toContain('data-panel="only"');
    expect(result.sections).toHaveLength(1);
  });

  it("includes title when provided", () => {
    const result = compose({
      title: "My Dashboard",
      sections: [
        { id: "a", view: "counter", data: { type: "counter", version: "1.0", value: 1 } },
      ],
    });

    expect(result.html).toContain("My Dashboard");
    expect(result.html).toContain("<title>My Dashboard</title>");
  });

  it("applies dark theme class", () => {
    const result = compose({
      theme: "dark",
      sections: [
        { id: "a", view: "counter", data: { type: "counter", version: "1.0", value: 1 } },
      ],
    });

    expect(result.html).toContain('class="dark"');
  });

  it("includes panel labels when provided", () => {
    const result = compose({
      sections: [
        { id: "a", view: "counter", data: { type: "counter" }, label: "KPI Panel" },
      ],
    });

    expect(result.html).toContain("KPI Panel");
  });

  it("escapes HTML in title and labels", () => {
    const result = compose({
      title: '<script>alert("xss")</script>',
      sections: [
        { id: "a", view: "counter", data: {}, label: '<img onerror="hack">' },
      ],
    });

    expect(result.html).not.toContain("<script>alert");
    expect(result.html).not.toContain('<img onerror');
    expect(result.html).toContain("&lt;script&gt;");
  });

  it("throws when no sections provided", () => {
    expect(() => compose({ sections: [] })).toThrow("at least one section");
  });

  it("uses custom gap", () => {
    const result = compose({
      gap: "24px",
      sections: [
        { id: "a", view: "counter", data: {} },
        { id: "b", view: "counter", data: {} },
      ],
    });

    expect(result.html).toContain("gap:24px");
  });

  // ── Cross-view state tests ──────────────────────────────────────

  it("augments data with compose overlay when initialState provided", () => {
    const result = compose({
      sections: [
        { id: "table", view: "datatable", data: { type: "datatable" } },
        { id: "map", view: "map", data: { type: "map" } },
      ],
      links: [
        {
          source: "table",
          target: "map",
          type: "selection",
          sourceField: "id",
          targetField: "feature_id",
        },
      ],
      initialState: {
        selections: { table: ["row-5"] },
      },
    });

    // The mock render function receives augmented data — we can check the HTML contains the view names
    expect(result.html).toContain('data-view="datatable"');
    expect(result.html).toContain('data-view="map"');
    expect(result.sections).toHaveLength(2);
  });

  it("adds data-view attribute to panels", () => {
    const result = compose({
      sections: [
        { id: "a", view: "counter", data: { type: "counter" } },
      ],
    });

    expect(result.html).toContain('data-view="counter"');
  });

  it("adds data-ssr-placeholder for browser-dependent views", () => {
    const result = compose({
      sections: [
        { id: "m", view: "map", data: { type: "map" } },
        { id: "c", view: "counter", data: { type: "counter" } },
      ],
    });

    expect(result.html).toContain('data-ssr-placeholder');
    // Counter should NOT have placeholder
    const counterPanel = result.html.match(/data-panel="c"[^>]*/);
    expect(counterPanel?.[0]).not.toContain("data-ssr-placeholder");
  });

  // ── Hydration tests ─────────────────────────────────────────────

  it("includes hydration scripts when hydrate=true", () => {
    const result = compose({
      hydrate: true,
      sections: [
        { id: "a", view: "counter", data: { type: "counter", value: 42 } },
      ],
    });

    expect(result.html).toContain("__COMPOSE_STATE__");
    expect(result.html).toContain('/compose/client.js"');
    expect(result.html).toContain('"view":"counter"');
  });

  it("does not include hydration scripts by default", () => {
    const result = compose({
      sections: [
        { id: "a", view: "counter", data: { type: "counter" } },
      ],
    });

    expect(result.html).not.toContain("__COMPOSE_STATE__");
    expect(result.html).not.toContain("client.js");
  });

  it("includes links in hydration state", () => {
    const links = [
      {
        source: "table",
        target: "map",
        type: "selection" as const,
        sourceField: "id",
        targetField: "feature_id",
      },
    ];
    const result = compose({
      hydrate: true,
      sections: [
        { id: "table", view: "datatable", data: {} },
        { id: "map", view: "map", data: {} },
      ],
      links,
    });

    expect(result.html).toContain('"source":"table"');
    expect(result.html).toContain('"target":"map"');
  });

  it("escapes < in hydration script to prevent injection", () => {
    const result = compose({
      hydrate: true,
      sections: [
        { id: "a", view: "counter", data: { type: "counter", note: "</script>" } },
      ],
    });

    // Should not contain literal </script> inside the __COMPOSE_STATE__ JSON
    // The < is escaped to \u003c so the browser doesn't interpret it as a closing tag
    const stateScript = result.html.match(/window\.__COMPOSE_STATE__=(.+?)<\/script>/)?.[1] ?? "";
    expect(stateScript).not.toContain("</script>");
    expect(stateScript).toContain("\\u003c");
  });
});

// ── infer ───────────────────────────────────────────────────────────

describe("infer", () => {
  it("returns suggestions for each data object", () => {
    const results = infer([
      {
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: { type: "Point", coordinates: [0, 0] }, properties: {} }],
      },
      { columns: ["a"], rows: [{ a: 1 }] },
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].index).toBe(0);
    expect(results[0].suggestions.length).toBeGreaterThan(0);
    expect(results[0].suggestions[0].view).toBe("map");
    expect(results[1].index).toBe(1);
    expect(results[1].suggestions.length).toBeGreaterThan(0);
  });

  it("infers counter for a bare number", () => {
    const results = infer([42]);
    expect(results).toHaveLength(1);
    expect(results[0].suggestions.length).toBeGreaterThan(0);
    expect(results[0].suggestions[0].view).toBe("counter");
  });
});
