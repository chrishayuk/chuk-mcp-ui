/**
 * Single source of truth for all view names in the monorepo.
 *
 * Every location that needs a list of views — SSR entry, compose client,
 * server VIEWS array, inference engine, Dockerfile — should derive from
 * these constants to avoid drift.
 */

/** Views that render fully via `renderToString` (no browser APIs needed). */
export const VIEWS_CORE = [
  "alert", "annotation", "audio", "boxplot", "calendar", "carousel",
  "chat", "code", "compare", "confirm", "counter", "crosstab",
  "dashboard", "datatable", "detail", "diff", "embed", "filter",
  "flowchart", "font", "form", "funnel", "gallery", "gantt", "gauge",
  "geostory", "gis-legend", "globe", "graph", "heatmap", "image",
  "investigation", "json", "kanban", "log", "markdown", "neural",
  "notebook", "pivot", "poll", "progress", "quiz", "ranked", "sankey",
  "settings", "slides", "spectrogram", "split", "status", "stepper",
  "sunburst", "swimlane", "tabs", "terminal", "threed", "timeline",
  "transcript", "tree", "treemap", "video", "wizard",
] as const;

/** Views that need browser APIs (Canvas, WebGL, Leaflet, pdf.js). SSR renders placeholders. */
export const VIEWS_BROWSER_DEPENDENT = [
  "chart", "map", "minimap", "pdf", "profile", "scatter", "timeseries",
] as const;

/** Views with placeholder-only SSR (no client renderer available yet). */
export const VIEWS_PLACEHOLDER_ONLY = [
  "shader",
] as const;

/** Every view in the system. */
export const ALL_VIEWS = [
  ...VIEWS_CORE,
  ...VIEWS_BROWSER_DEPENDENT,
  ...VIEWS_PLACEHOLDER_ONLY,
] as const;

/** Old view names that map to current views. */
export const VIEW_ALIASES: Record<string, string> = {
  layers: "map",
};

/** Union type of all valid view names. */
export type ViewName = (typeof ALL_VIEWS)[number];

/** Set of all view names (for O(1) lookups). */
export const ALL_VIEWS_SET: ReadonlySet<string> = new Set(ALL_VIEWS);

/** Set of browser-dependent view names (placeholder SSR + full client). */
export const BROWSER_DEPENDENT_SET: ReadonlySet<string> = new Set([
  ...VIEWS_BROWSER_DEPENDENT,
  ...VIEWS_PLACEHOLDER_ONLY,
]);
