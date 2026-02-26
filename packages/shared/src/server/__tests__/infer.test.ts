import { describe, it, expect } from "vitest";
import {
  inferView,
  isGeoJSON,
  isTabular,
  isTimeSeries,
  isHierarchical,
  hasDateKey,
  isNumericHeavy,
} from "../infer";

// ---------------------------------------------------------------------------
// Helper: assert the top suggestion matches a given view name
// ---------------------------------------------------------------------------

function expectTopView(data: unknown, expectedView: string) {
  const results = inferView(data);
  expect(results.length).toBeGreaterThan(0);
  expect(results[0].view).toBe(expectedView);
}

function expectTopConfidence(data: unknown, expectedConfidence: number) {
  const results = inferView(data);
  expect(results.length).toBeGreaterThan(0);
  expect(results[0].confidence).toBe(expectedConfidence);
}

function expectViewPresent(data: unknown, viewName: string) {
  const results = inferView(data);
  expect(results.some((r) => r.view === viewName)).toBe(true);
}

// ===========================================================================
// Detection helper unit tests
// ===========================================================================

describe("isGeoJSON", () => {
  it("detects FeatureCollection", () => {
    expect(isGeoJSON({ type: "FeatureCollection", features: [] })).toBe(true);
  });

  it("detects Feature", () => {
    expect(
      isGeoJSON({
        type: "Feature",
        geometry: { type: "Point", coordinates: [0, 0] },
      })
    ).toBe(true);
  });

  it("rejects non-GeoJSON object", () => {
    expect(isGeoJSON({ type: "something", data: [] })).toBe(false);
  });

  it("rejects primitives", () => {
    expect(isGeoJSON("hello")).toBe(false);
    expect(isGeoJSON(42)).toBe(false);
    expect(isGeoJSON(null)).toBe(false);
  });
});

describe("isTabular", () => {
  it("returns true for uniform array of 3+ objects", () => {
    const rows = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
      { a: 5, b: 6 },
    ];
    expect(isTabular(rows)).toBe(true);
  });

  it("returns false for non-uniform objects", () => {
    const rows = [
      { a: 1, b: 2 },
      { a: 3, c: 4 },
      { a: 5, b: 6 },
    ];
    expect(isTabular(rows)).toBe(false);
  });

  it("returns false for fewer than minItems", () => {
    expect(isTabular([{ a: 1 }, { a: 2 }])).toBe(false);
  });

  it("returns false for non-arrays", () => {
    expect(isTabular({ a: 1 })).toBe(false);
  });
});

describe("hasDateKey", () => {
  it("detects date keys", () => {
    expect(hasDateKey({ date: "2024-01-01", value: 10 })).toBe(true);
    expect(hasDateKey({ timestamp: 123, v: 1 })).toBe(true);
    expect(hasDateKey({ time: "10:00", v: 1 })).toBe(true);
    expect(hasDateKey({ created_at: "x", v: 1 })).toBe(true);
  });

  it("returns false when no date key", () => {
    expect(hasDateKey({ name: "foo", value: 10 })).toBe(false);
  });
});

describe("isTimeSeries", () => {
  it("detects time-indexed numeric data", () => {
    const ts = [
      { date: "2024-01-01", value: 10 },
      { date: "2024-01-02", value: 20 },
      { date: "2024-01-03", value: 30 },
    ];
    expect(isTimeSeries(ts)).toBe(true);
  });

  it("rejects data without date key", () => {
    const rows = [
      { name: "a", value: 1 },
      { name: "b", value: 2 },
    ];
    expect(isTimeSeries(rows)).toBe(false);
  });

  it("rejects data with date key but no numeric values", () => {
    const rows = [
      { date: "2024-01-01", label: "a" },
      { date: "2024-01-02", label: "b" },
    ];
    expect(isTimeSeries(rows)).toBe(false);
  });
});

describe("isHierarchical", () => {
  it("detects object with children", () => {
    expect(
      isHierarchical({ name: "root", children: [{ name: "child" }] })
    ).toBe(true);
  });

  it("detects parent/parentId arrays", () => {
    expect(
      isHierarchical([
        { id: 1, parentId: null },
        { id: 2, parentId: 1 },
      ])
    ).toBe(true);
  });

  it("rejects flat objects", () => {
    expect(isHierarchical({ a: 1, b: 2 })).toBe(false);
  });
});

describe("isNumericHeavy", () => {
  it("returns true when > 50% values are numbers", () => {
    const rows = [
      { a: 1, b: 2, c: "x" },
      { a: 3, b: 4, c: "y" },
    ];
    expect(isNumericHeavy(rows)).toBe(true);
  });

  it("returns false when <= 50% values are numbers", () => {
    const rows = [
      { a: "x", b: "y", c: 1 },
      { a: "z", b: "w", c: 2 },
    ];
    expect(isNumericHeavy(rows)).toBe(false);
  });
});

// ===========================================================================
// inferView integration tests
// ===========================================================================

describe("inferView", () => {
  // -----------------------------------------------------------------------
  // Structured content (exact match)
  // -----------------------------------------------------------------------

  describe("structuredContent", () => {
    it("returns the declared type at confidence 1.0", () => {
      const data = {
        type: "chart",
        version: "1.0",
        series: [{ data: [1, 2, 3] }],
      };
      const results = inferView(data);
      expect(results).toHaveLength(1);
      expect(results[0].view).toBe("chart");
      expect(results[0].confidence).toBe(1.0);
    });

    it("works for any known view type", () => {
      expectTopView({ type: "kanban", version: "1" }, "kanban");
      expectTopConfidence({ type: "kanban", version: "1" }, 1.0);
    });

    it("does not match unknown type even with version", () => {
      const data = { type: "foobar", version: "1.0" };
      const results = inferView(data);
      expect(results[0].confidence).toBeLessThan(1.0);
    });
  });

  // -----------------------------------------------------------------------
  // Spatial / Geo
  // -----------------------------------------------------------------------

  describe("geo / map", () => {
    it("GeoJSON FeatureCollection → map (0.95)", () => {
      const data = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-0.09, 51.505] },
            properties: { name: "London" },
          },
        ],
      };
      expectTopView(data, "map");
      expectTopConfidence(data, 0.95);
    });

    it("GeoJSON Feature → map (0.95)", () => {
      const data = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-0.09, 51.505] },
        properties: { name: "London" },
      };
      expectTopView(data, "map");
    });

    it("center + layers → map (0.95)", () => {
      expectTopView(
        { center: [51.5, -0.1], layers: [{ url: "tile" }] },
        "map"
      );
    });

    it("center + markers → map (0.90)", () => {
      expectTopView(
        { center: [51.5, -0.1], markers: [{ lat: 51.5, lon: -0.1 }] },
        "map"
      );
    });

    it("array of {lat, lon, name} → map (0.85)", () => {
      const data = [
        { lat: 51.5, lon: -0.09, name: "London" },
        { lat: 48.8, lon: 2.35, name: "Paris" },
      ];
      expectTopView(data, "map");
    });

    it("array of {latitude, longitude} → map", () => {
      const data = [
        { latitude: 51.5, longitude: -0.09, name: "London" },
        { latitude: 48.8, longitude: 2.35, name: "Paris" },
      ];
      expectTopView(data, "map");
    });
  });

  // -----------------------------------------------------------------------
  // Tabular
  // -----------------------------------------------------------------------

  describe("tabular / datatable", () => {
    it("{columns, rows} → datatable (0.95)", () => {
      const data = {
        columns: ["Name", "Age"],
        rows: [
          ["Alice", 30],
          ["Bob", 25],
        ],
      };
      expectTopView(data, "datatable");
      expectTopConfidence(data, 0.95);
    });

    it("uniform array of objects → datatable (0.80)", () => {
      const data = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
        { name: "Charlie", age: 35 },
      ];
      expectTopView(data, "datatable");
    });

    it("numeric-heavy uniform array also suggests chart", () => {
      const data = [
        { x: 1, y: 10, z: 100 },
        { x: 2, y: 20, z: 200 },
        { x: 3, y: 30, z: 300 },
      ];
      expectTopView(data, "datatable");
      expectViewPresent(data, "chart");
    });
  });

  // -----------------------------------------------------------------------
  // Counter
  // -----------------------------------------------------------------------

  describe("counter", () => {
    it("{value: 42, label: 'Count'} → counter (0.90)", () => {
      expectTopView({ value: 42, label: "Count" }, "counter");
      expectTopConfidence({ value: 42, label: "Count" }, 0.90);
    });

    it("single number → counter (0.85)", () => {
      expectTopView(42, "counter");
      expectTopConfidence(42, 0.85);
    });
  });

  // -----------------------------------------------------------------------
  // Time-based
  // -----------------------------------------------------------------------

  describe("time-based", () => {
    it("time-series array → timeseries (0.85)", () => {
      const data = [
        { date: "2024-01-01", value: 10 },
        { date: "2024-01-02", value: 20 },
        { date: "2024-01-03", value: 30 },
      ];
      expectTopView(data, "timeseries");
    });

    it("timeline array (date + title) → timeline (0.85)", () => {
      const data = [
        { date: "2024-01-01", title: "Founded" },
        { date: "2024-06-15", title: "Series A" },
        { date: "2025-01-01", title: "Launch" },
      ];
      // Both timeseries and timeline could match, but timeline has
      // non-numeric values so timeseries won't fire
      expectTopView(data, "timeline");
    });
  });

  // -----------------------------------------------------------------------
  // Hierarchical / tree
  // -----------------------------------------------------------------------

  describe("tree", () => {
    it("object with children → tree (0.90)", () => {
      const data = {
        name: "root",
        children: [
          { name: "child1", children: [] },
          { name: "child2" },
        ],
      };
      expectTopView(data, "tree");
      expectTopConfidence(data, 0.90);
    });

    it("array with parentId → tree (0.85)", () => {
      const data = [
        { id: 1, parentId: null, name: "root" },
        { id: 2, parentId: 1, name: "child" },
        { id: 3, parentId: 1, name: "child2" },
      ];
      expectTopView(data, "tree");
    });
  });

  // -----------------------------------------------------------------------
  // Graph / flow
  // -----------------------------------------------------------------------

  describe("graph / flowchart / sankey", () => {
    it("{nodes, edges} → graph (0.90)", () => {
      const data = {
        nodes: [{ id: "a" }, { id: "b" }],
        edges: [{ source: "a", target: "b" }],
      };
      expectViewPresent(data, "graph");
    });

    it("{nodes, links} → graph (0.90)", () => {
      const data = {
        nodes: [{ id: "a" }, { id: "b" }],
        links: [{ source: "a", target: "b" }],
      };
      expectViewPresent(data, "graph");
    });

    it("{nodes, edges} with positions → flowchart (0.85) and graph (0.90)", () => {
      const data = {
        nodes: [
          { id: "a", position: { x: 0, y: 0 }, type: "input" },
          { id: "b", position: { x: 100, y: 100 } },
        ],
        edges: [{ source: "a", target: "b" }],
      };
      expectViewPresent(data, "flowchart");
      expectViewPresent(data, "graph");
    });

    it("{nodes, links} with numeric values → sankey (0.85)", () => {
      const data = {
        nodes: [{ id: "A" }, { id: "B" }, { id: "C" }],
        links: [
          { source: "A", target: "B", value: 100 },
          { source: "B", target: "C", value: 50 },
        ],
      };
      expectViewPresent(data, "sankey");
    });
  });

  // -----------------------------------------------------------------------
  // Text
  // -----------------------------------------------------------------------

  describe("text / markdown / code", () => {
    it("markdown string → markdown (0.90)", () => {
      const md = "# Hello World\n\nThis is **bold** text.\n\n```js\nconsole.log('hi');\n```";
      expectTopView(md, "markdown");
      expectTopConfidence(md, 0.90);
    });

    it("plain string → markdown (0.70)", () => {
      expectTopView("Just a plain string", "markdown");
      expectTopConfidence("Just a plain string", 0.70);
    });

    it("{language, code} → code (0.95)", () => {
      const data = { language: "python", code: "print('hi')" };
      expectTopView(data, "code");
      expectTopConfidence(data, 0.95);
    });

    it("{language, source} → code (0.95)", () => {
      const data = { language: "javascript", source: "console.log('hi')" };
      expectTopView(data, "code");
      expectTopConfidence(data, 0.95);
    });
  });

  // -----------------------------------------------------------------------
  // Media
  // -----------------------------------------------------------------------

  describe("media", () => {
    it("url ending in .png → image (0.90)", () => {
      expectTopView({ url: "https://example.com/photo.png" }, "image");
    });

    it("url ending in .jpg → image", () => {
      expectTopView({ url: "https://example.com/photo.jpg" }, "image");
    });

    it("url ending in .mp4 → video (0.90)", () => {
      expectTopView({ url: "https://example.com/clip.mp4" }, "video");
    });

    it("url ending in .webm → video", () => {
      expectTopView({ url: "https://example.com/clip.webm" }, "video");
    });

    it("url ending in .mp3 → audio (0.90)", () => {
      expectTopView({ url: "https://example.com/song.mp3" }, "audio");
    });

    it("url ending in .wav → audio", () => {
      expectTopView({ url: "https://example.com/sound.wav" }, "audio");
    });

    it("url ending in .pdf → pdf (0.90)", () => {
      expectTopView({ url: "https://example.com/doc.pdf" }, "pdf");
    });

    it("url with query params still matches", () => {
      expectTopView(
        { url: "https://example.com/photo.png?width=100" },
        "image"
      );
    });
  });

  // -----------------------------------------------------------------------
  // Detail (key-value)
  // -----------------------------------------------------------------------

  describe("detail", () => {
    it("object with fields array of {label, value} → detail (0.90)", () => {
      const data = {
        fields: [
          { label: "Name", value: "Alice" },
          { label: "Age", value: 30 },
        ],
      };
      expectTopView(data, "detail");
      expectTopConfidence(data, 0.90);
    });

    it("flat object with all scalar values → detail (0.75)", () => {
      const data = { name: "Alice", age: 30, active: true };
      expectTopView(data, "detail");
      expectTopConfidence(data, 0.75);
    });
  });

  // -----------------------------------------------------------------------
  // Status / stepper
  // -----------------------------------------------------------------------

  describe("status / stepper", () => {
    it("array of {status, name} → status (0.85)", () => {
      const data = [
        { name: "API", status: "healthy" },
        { name: "DB", status: "degraded" },
        { name: "Cache", status: "healthy" },
      ];
      expectTopView(data, "status");
    });

    it("{steps: [{status}]} → stepper (0.85)", () => {
      const data = {
        steps: [
          { label: "Step 1", status: "complete" },
          { label: "Step 2", status: "active" },
          { label: "Step 3", status: "pending" },
        ],
      };
      expectTopView(data, "stepper");
      expectTopConfidence(data, 0.85);
    });
  });

  // -----------------------------------------------------------------------
  // Fallback
  // -----------------------------------------------------------------------

  describe("fallback", () => {
    it("unknown object → json (0.30)", () => {
      const data = { foo: [1, 2, 3], bar: { nested: true } };
      expectViewPresent(data, "json");
      const results = inferView(data);
      const jsonResult = results.find((r) => r.view === "json");
      expect(jsonResult?.confidence).toBe(0.30);
    });

    it("unknown array → json (0.30)", () => {
      // Non-uniform array that doesn't match other patterns
      const data = [1, "two", true, null];
      const results = inferView(data);
      expect(results[0].view).toBe("json");
      expect(results[0].confidence).toBe(0.30);
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  describe("edge cases", () => {
    it("returns sorted results (highest confidence first)", () => {
      // Numeric-heavy uniform array triggers both datatable and chart
      const data = [
        { x: 1, y: 10, z: 100 },
        { x: 2, y: 20, z: 200 },
        { x: 3, y: 30, z: 300 },
      ];
      const results = inferView(data);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].confidence).toBeLessThanOrEqual(
          results[i - 1].confidence
        );
      }
    });

    it("every suggestion has view, confidence, reason", () => {
      const data = { some: "data", items: [1, 2, 3] };
      const results = inferView(data);
      for (const s of results) {
        expect(s).toHaveProperty("view");
        expect(s).toHaveProperty("confidence");
        expect(s).toHaveProperty("reason");
        expect(typeof s.view).toBe("string");
        expect(typeof s.confidence).toBe("number");
        expect(typeof s.reason).toBe("string");
        expect(s.confidence).toBeGreaterThanOrEqual(0);
        expect(s.confidence).toBeLessThanOrEqual(1);
      }
    });

    it("deduplicates — only the highest-confidence entry per view", () => {
      // center + layers gives map 0.95, center + markers gives map 0.90
      // Only the 0.95 should survive
      const data = { center: [0, 0], layers: [], markers: [] };
      const results = inferView(data);
      const mapResults = results.filter((r) => r.view === "map");
      expect(mapResults).toHaveLength(1);
      expect(mapResults[0].confidence).toBe(0.95);
    });

    it("null input → empty array", () => {
      expect(inferView(null)).toEqual([]);
    });

    it("undefined input → empty array", () => {
      expect(inferView(undefined)).toEqual([]);
    });

    it("empty object → json fallback", () => {
      // Empty object: no scalar values → detail won't match, only json
      const results = inferView({});
      expect(results).toHaveLength(1);
      expect(results[0].view).toBe("json");
    });

    it("empty array → json fallback", () => {
      const results = inferView([]);
      expect(results).toHaveLength(1);
      expect(results[0].view).toBe("json");
    });
  });
});
