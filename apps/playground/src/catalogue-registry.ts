/**
 * View Catalogue Registry — single source of truth for all view metadata.
 *
 * Combines view names, descriptions, categories, tags, and SSR status
 * into a searchable, filterable registry for the catalogue UI.
 */

export type Category =
  | "Core"
  | "Developer"
  | "Status & Monitoring"
  | "Interactive Input"
  | "Media"
  | "Data-Dense"
  | "Geo-Specialist"
  | "Specialist"
  | "Novel Compound"
  | "Flow & Process"
  | "Content & Narrative"
  | "Advanced";

export const CATEGORIES: Category[] = [
  "Core",
  "Developer",
  "Status & Monitoring",
  "Interactive Input",
  "Media",
  "Data-Dense",
  "Geo-Specialist",
  "Specialist",
  "Novel Compound",
  "Flow & Process",
  "Content & Narrative",
  "Advanced",
];

export interface ViewEntry {
  /** URL-safe view name, e.g. "counter" */
  name: string;
  /** Human-readable name, e.g. "Counter" */
  displayName: string;
  /** Short description from package.json */
  description: string;
  /** Catalogue category */
  category: Category;
  /** Roadmap phase that introduced this view */
  phase: number;
  /** Search keywords */
  tags: string[];
  /** Whether full SSR is available (false = placeholder/browser-dependent) */
  ssr: boolean;
}

/** Views that use placeholder SSR (browser-dependent) */
const PLACEHOLDER_SSR = new Set([
  "map", "minimap", "layers", "chart", "profile",
  "scatter", "timeseries", "pdf", "shader",
]);

function toDisplayName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function entry(
  name: string,
  description: string,
  category: Category,
  phase: number,
  tags: string[],
): ViewEntry {
  return {
    name,
    displayName: toDisplayName(name),
    description,
    category,
    phase,
    tags,
    ssr: !PLACEHOLDER_SSR.has(name),
  };
}

export const REGISTRY: ViewEntry[] = [
  // ── Core (27) ──────────────────────────────────────────────────────
  entry("chart", "Statistical chart — bar, line, scatter, pie, and more", "Core", 2, ["bar", "line", "pie", "scatter", "visualization"]),
  entry("chat", "Embedded chat interface", "Core", 2, ["conversation", "messaging", "ai"]),
  entry("code", "Syntax-highlighted code viewer — powered by Shiki", "Core", 3, ["syntax", "highlighting", "snippet", "shiki"]),
  entry("compare", "Before/after image comparison slider", "Core", 2, ["image", "slider", "diff", "before-after"]),
  entry("confirm", "Confirmation dialog with severity levels", "Core", 3, ["dialog", "action", "destructive", "safety"]),
  entry("counter", "Numeric KPI counter with delta, sparkline, and color coding", "Core", 3, ["kpi", "number", "metric", "sparkline"]),
  entry("dashboard", "Composition — arranges child Views in panels", "Core", 2, ["layout", "grid", "composition", "panels"]),
  entry("datatable", "Sortable, filterable data table", "Core", 1, ["table", "grid", "sort", "filter", "csv"]),
  entry("detail", "Single-record display — fields, sections, and action buttons", "Core", 3, ["record", "profile", "fields", "card"]),
  entry("form", "Dynamic form from JSON Schema", "Core", 2, ["input", "schema", "submit", "fields"]),
  entry("gallery", "Card grid gallery", "Core", 3, ["cards", "thumbnails", "grid", "images"]),
  entry("image", "Zoomable image viewer with annotations", "Core", 3, ["zoom", "pan", "annotate", "photo"]),
  entry("json", "Interactive JSON tree viewer — collapsible with search", "Core", 3, ["tree", "debug", "inspect", "collapse"]),
  entry("log", "Streaming log viewer with level filtering", "Core", 3, ["stream", "debug", "tail", "levels"]),
  entry("map", "Interactive map with GeoJSON, clustering, and popups", "Core", 1, ["leaflet", "geojson", "spatial", "markers"]),
  entry("markdown", "Rich markdown renderer", "Core", 2, ["text", "rich", "formatting", "prose"]),
  entry("pdf", "PDF viewer using pdf.js", "Core", 2, ["document", "pages", "zoom", "viewer"]),
  entry("poll", "Live poll and voting", "Core", 3, ["vote", "survey", "results", "bar"]),
  entry("progress", "Multi-track progress bars with status indicators", "Core", 3, ["loading", "bar", "percentage", "status"]),
  entry("quiz", "Interactive quiz", "Core", 3, ["questions", "answers", "timer", "score"]),
  entry("ranked", "Ranked list with scores", "Core", 3, ["list", "scores", "leaderboard", "sort"]),
  entry("split", "Two-panel split layout", "Core", 2, ["layout", "panels", "side-by-side"]),
  entry("status", "System status board — traffic-light indicators", "Core", 3, ["health", "uptime", "monitoring", "traffic-light"]),
  entry("tabs", "Tabbed composition", "Core", 2, ["layout", "navigation", "panels"]),
  entry("timeline", "Events timeline", "Core", 3, ["events", "chronology", "history", "dates"]),
  entry("tree", "Hierarchical tree explorer", "Core", 3, ["hierarchy", "expand", "collapse", "nodes"]),
  entry("video", "HTML5 video player", "Core", 2, ["media", "playback", "player", "poster"]),

  // ── Developer (2) ──────────────────────────────────────────────────
  entry("diff", "Unified and split diff rendering with syntax highlighting", "Developer", 3, ["code", "patch", "changes", "side-by-side"]),
  entry("kanban", "Kanban board with drag-and-drop and WIP limits", "Developer", 3, ["board", "cards", "columns", "agile"]),

  // ── Status & Monitoring (2) ────────────────────────────────────────
  entry("alert", "Notification/alert cards — severity-coded with dismiss and actions", "Status & Monitoring", 3, ["notification", "warning", "error", "severity"]),
  entry("stepper", "Multi-step progress indicator — horizontal or vertical", "Status & Monitoring", 3, ["steps", "wizard", "progress", "navigation"]),

  // ── Interactive Input (3) ──────────────────────────────────────────
  entry("filter", "Standalone filter bar — broadcasts via cross-view bus", "Interactive Input", 3, ["search", "facets", "controls", "broadcast"]),
  entry("settings", "Configuration panel — grouped fields with save/reset", "Interactive Input", 3, ["config", "preferences", "toggle", "options"]),
  entry("embed", "Generic iframe wrapper for external URLs", "Interactive Input", 3, ["iframe", "external", "url", "sandbox"]),

  // ── Media (2) ──────────────────────────────────────────────────────
  entry("audio", "Audio player with waveform and region visualization", "Media", 4, ["waveform", "playback", "sound", "regions"]),
  entry("carousel", "Image/content carousel with slide/fade transitions", "Media", 4, ["slideshow", "gallery", "auto-play", "navigation"]),

  // ── Data-Dense (8) ─────────────────────────────────────────────────
  entry("heatmap", "Grid heatmap — color-interpolated matrix with tooltips", "Data-Dense", 4, ["matrix", "color", "intensity", "grid"]),
  entry("gauge", "Single-value arc/dial metric with threshold zones", "Data-Dense", 4, ["meter", "dial", "arc", "threshold"]),
  entry("treemap", "Nested rectangles with squarified layout and drill-down", "Data-Dense", 4, ["hierarchy", "area", "proportion", "drill-down"]),
  entry("sunburst", "Radial hierarchical chart with interactive drill-down", "Data-Dense", 4, ["radial", "hierarchy", "ring", "drill-down"]),
  entry("scatter", "Scatter and bubble plot with tooltips and zoom", "Data-Dense", 4, ["plot", "bubble", "correlation", "zoom"]),
  entry("boxplot", "Box-and-whisker plot with outliers", "Data-Dense", 4, ["statistics", "quartiles", "distribution", "outliers"]),
  entry("pivot", "Pivot table — aggregation engine with sortable columns", "Data-Dense", 4, ["aggregation", "grouping", "totals", "spreadsheet"]),
  entry("crosstab", "Matrix with conditional formatting — heatmap, bars, percentages", "Data-Dense", 4, ["matrix", "formatting", "confusion", "correlation"]),

  // ── Geo-Specialist (5) ─────────────────────────────────────────────
  entry("layers", "Multi-layer map with layer controls and choropleth styling", "Geo-Specialist", 4, ["leaflet", "choropleth", "toggle", "spatial"]),
  entry("timeseries", "Time-axis chart — line, bar, area on time scale", "Geo-Specialist", 4, ["time", "trend", "zoom", "date-axis"]),
  entry("profile", "Elevation/cross-section line chart with fill and markers", "Geo-Specialist", 4, ["elevation", "cross-section", "terrain", "line"]),
  entry("minimap", "Overview-detail dual map with extent rectangle", "Geo-Specialist", 4, ["overview", "detail", "linked", "extent"]),
  entry("gis-legend", "Cartographic legend — SVG symbol swatches with labels", "Geo-Specialist", 4, ["legend", "symbology", "cartography", "swatches"]),

  // ── Specialist (2) ─────────────────────────────────────────────────
  entry("terminal", "Terminal with ANSI colors — monospace with SGR rendering", "Specialist", 4, ["ansi", "console", "monospace", "shell"]),
  entry("spectrogram", "Audio frequency visualization with colormap", "Specialist", 4, ["frequency", "audio", "fft", "colormap"]),

  // ── Novel Compound (4) ─────────────────────────────────────────────
  entry("notebook", "Compound notebook — markdown, code, table, and chart cells", "Novel Compound", 6, ["cells", "report", "interactive", "multi-type"]),
  entry("investigation", "Investigation board — spatial workspace", "Novel Compound", 6, ["workspace", "spatial", "discovery", "multi-panel"]),
  entry("annotation", "Image annotation with SVG overlays", "Novel Compound", 6, ["overlay", "drawing", "svg", "markup"]),
  entry("chat", "Embedded chat interface", "Novel Compound", 6, ["conversation", "messaging", "ai"]),

  // ── Flow & Process (5) ─────────────────────────────────────────────
  entry("sankey", "Sankey diagram — flow quantities between stages", "Flow & Process", 6, ["flow", "energy", "alluvial", "connections"]),
  entry("funnel", "Funnel — progressive reduction through stages", "Flow & Process", 6, ["conversion", "pipeline", "stages", "rates"]),
  entry("gantt", "Gantt chart — task bars on time axis with dependencies", "Flow & Process", 6, ["schedule", "tasks", "dependencies", "timeline"]),
  entry("swimlane", "Swimlane diagram — horizontal lanes per actor/system", "Flow & Process", 6, ["lanes", "workflow", "process", "actors"]),
  entry("flowchart", "Flowchart — auto-layout SVG with node shapes and edges", "Flow & Process", 6, ["diagram", "nodes", "edges", "decision"]),

  // ── Content & Narrative (3) ────────────────────────────────────────
  entry("geostory", "Scrollytelling narrative — scroll triggers map animation", "Content & Narrative", 6, ["scrollytelling", "narrative", "story", "map"]),
  entry("slides", "Slides presentation", "Content & Narrative", 6, ["presentation", "fullscreen", "sequential", "deck"]),
  entry("neural", "Neural network layer visualization", "Content & Narrative", 6, ["network", "layers", "activations", "weights"]),

  // ── Advanced (4) ───────────────────────────────────────────────────
  entry("globe", "Interactive globe — orthographic SVG projection with points and arcs", "Advanced", 6, ["3d", "earth", "projection", "arcs"]),
  entry("threed", "3D scene — isometric SVG with geometric primitives", "Advanced", 6, ["3d", "three.js", "orbit", "scene"]),
  entry("graph", "Force-directed graph — nodes and edges visualization", "Advanced", 6, ["network", "force", "nodes", "edges"]),
  entry("calendar", "Calendar — month grid and agenda views", "Advanced", 6, ["date", "events", "month", "schedule"]),
  entry("font", "Font specimen display with size and weight previews", "Advanced", 6, ["typography", "specimen", "preview", "typeface"]),
  entry("wizard", "Multi-step conditional form wizard", "Advanced", 6, ["steps", "conditional", "form", "branching"]),
  entry("transcript", "Timestamped speaker-labelled transcript", "Advanced", 6, ["speech", "speakers", "timestamps", "text"]),
  entry("shader", "GLSL shader playground", "Advanced", 6, ["glsl", "webgl", "fragment", "graphics"]),
];

// ── Fix: chat appears in both Core and Novel Compound.
// Remove the duplicate — chat is Core (Phase 2), not Novel Compound.
// The Novel Compound "chat" entry was an error from the roadmap.
// Filter it out at module level.
const seen = new Set<string>();
const deduped: ViewEntry[] = [];
for (const e of REGISTRY) {
  if (!seen.has(e.name)) {
    seen.add(e.name);
    deduped.push(e);
  }
}

/** Deduplicated registry (70 unique views) */
export const registry: ViewEntry[] = deduped;

/** Look up a view by name */
export function getView(name: string): ViewEntry | undefined {
  return registry.find((v) => v.name === name);
}

/** Group views by category */
export function getViewsByCategory(): Map<Category, ViewEntry[]> {
  const map = new Map<Category, ViewEntry[]>();
  for (const cat of CATEGORIES) {
    map.set(cat, []);
  }
  for (const v of registry) {
    map.get(v.category)!.push(v);
  }
  return map;
}
