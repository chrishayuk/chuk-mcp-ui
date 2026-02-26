/**
 * View inference engine.
 *
 * Analyzes an unknown data object and suggests which chuk view(s)
 * would best render it. Returns ranked suggestions with confidence
 * scores and human-readable explanations.
 *
 * @module @chuk/view-shared/server/infer
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ViewSuggestion {
  /** View name, e.g. "map", "datatable" */
  view: string;
  /** Confidence score between 0 and 1 */
  confidence: number;
  /** Human-readable explanation of why this view was chosen */
  reason: string;
}

// ---------------------------------------------------------------------------
// Known view names (used for structuredContent type matching)
// ---------------------------------------------------------------------------

const KNOWN_VIEWS = new Set([
  "alert", "annotation", "audio", "boxplot", "calendar", "carousel",
  "chart", "chat", "code", "compare", "confirm", "counter", "crosstab",
  "dashboard", "datatable", "detail", "diff", "embed", "filter",
  "flowchart", "form", "funnel", "gallery", "gantt", "gauge", "geostory",
  "gis-legend", "globe", "graph", "heatmap", "image", "investigation",
  "json", "kanban", "layers", "log", "map", "markdown", "minimap",
  "neural", "notebook", "pdf", "pivot", "poll", "profile", "progress",
  "quiz", "ranked", "sankey", "scatter", "settings", "shader", "slides",
  "spectrogram", "split", "status", "stepper", "sunburst", "swimlane",
  "tabs", "terminal", "threed", "timeline", "timeseries", "transcript",
  "tree", "treemap", "video", "wizard",
]);

// ---------------------------------------------------------------------------
// Type guards & helpers
// ---------------------------------------------------------------------------

/** Narrow to a plain object (non-null, non-array). */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Check that every element of `arr` is a plain object. */
function isObjectArray(arr: unknown[]): arr is Record<string, unknown>[] {
  return arr.length > 0 && arr.every(isPlainObject);
}

/** Return true if `v` is a finite number (not NaN). */
function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Return true if `v` is a string. */
function isStr(v: unknown): v is string {
  return typeof v === "string";
}


// ---------------------------------------------------------------------------
// Exported detection helpers
// ---------------------------------------------------------------------------

/**
 * Check whether `data` conforms to the GeoJSON specification
 * (FeatureCollection or Feature with geometry).
 */
export function isGeoJSON(data: unknown): boolean {
  if (!isPlainObject(data)) return false;
  const t = data.type;
  if (t === "FeatureCollection" && Array.isArray(data.features)) return true;
  if (t === "Feature" && isPlainObject(data.geometry)) return true;
  return false;
}

/**
 * Check whether `data` is an array of uniform objects (all sharing the
 * same set of keys). Requires at least `minItems` entries.
 */
export function isTabular(data: unknown, minItems = 3): boolean {
  if (!Array.isArray(data) || data.length < minItems) return false;
  if (!isObjectArray(data)) return false;
  const keys = Object.keys(data[0]).sort().join(",");
  return data.every((row) => Object.keys(row).sort().join(",") === keys);
}

/**
 * Return true if `obj` contains a key that looks like a date / time
 * identifier (e.g. "date", "time", "timestamp", "created_at").
 */
export function hasDateKey(obj: Record<string, unknown>): boolean {
  const datePatterns = /^(date|time|timestamp|datetime|created_at|updated_at|ts|day|month|year)$/i;
  return Object.keys(obj).some((k) => datePatterns.test(k));
}

/**
 * Check whether `data` is an array of time-indexed objects
 * (each entry has a date/time key plus at least one numeric value).
 */
export function isTimeSeries(data: unknown): boolean {
  if (!Array.isArray(data) || data.length < 2) return false;
  if (!isObjectArray(data)) return false;
  if (!hasDateKey(data[0])) return false;
  // At least one non-date key should be numeric across most rows
  const datePatterns = /^(date|time|timestamp|datetime|created_at|updated_at|ts|day|month|year)$/i;
  const nonDateKeys = Object.keys(data[0]).filter((k) => !datePatterns.test(k));
  if (nonDateKeys.length === 0) return false;
  const numericCount = nonDateKeys.filter((k) =>
    data.every((row) => isNumber(row[k]))
  ).length;
  return numericCount > 0;
}

/**
 * Check whether `data` looks hierarchical (has recursive `children`
 * arrays, or is an array of objects with `parent`/`parentId` fields).
 */
export function isHierarchical(data: unknown): boolean {
  if (isPlainObject(data) && Array.isArray(data.children)) return true;
  if (
    Array.isArray(data) &&
    isObjectArray(data) &&
    data.every((row) => "parent" in row || "parentId" in row)
  ) {
    return true;
  }
  return false;
}

/**
 * Return true if most values across the given rows are numbers.
 * "Most" means > 50 % of all non-key values.
 */
export function isNumericHeavy(rows: Record<string, unknown>[]): boolean {
  let total = 0;
  let numeric = 0;
  for (const row of rows) {
    for (const v of Object.values(row)) {
      total++;
      if (isNumber(v)) numeric++;
    }
  }
  return total > 0 && numeric / total > 0.5;
}

// ---------------------------------------------------------------------------
// Internal matchers — each returns zero or more ViewSuggestions
// ---------------------------------------------------------------------------

type Matcher = (data: unknown) => ViewSuggestion[];

/** Structured content: data already declares its own view type. */
const matchStructuredContent: Matcher = (data) => {
  if (!isPlainObject(data)) return [];
  if (
    isStr(data.type) &&
    KNOWN_VIEWS.has(data.type) &&
    data.version !== undefined
  ) {
    return [
      {
        view: data.type,
        confidence: 1.0,
        reason: `Data is already structuredContent with type "${data.type}" and version "${data.version}"`,
      },
    ];
  }
  return [];
};

/** GeoJSON FeatureCollection / Feature. */
const matchGeoJSON: Matcher = (data) => {
  if (isGeoJSON(data)) {
    const t = (data as Record<string, unknown>).type as string;
    return [
      {
        view: "map",
        confidence: 0.95,
        reason: `Data is a GeoJSON ${t}`,
      },
    ];
  }
  return [];
};

/** Map with center + layers. */
const matchMapCenterLayers: Matcher = (data) => {
  if (!isPlainObject(data)) return [];
  if (data.center && Array.isArray(data.layers)) {
    return [
      { view: "map", confidence: 0.95, reason: "Object has center + layers" },
    ];
  }
  return [];
};

/** Map with center + markers. */
const matchMapCenterMarkers: Matcher = (data) => {
  if (!isPlainObject(data)) return [];
  if (data.center && Array.isArray(data.markers)) {
    return [
      { view: "map", confidence: 0.90, reason: "Object has center + markers" },
    ];
  }
  return [];
};

/** Array of lat/lon objects. */
const matchLatLonArray: Matcher = (data) => {
  if (!Array.isArray(data) || data.length < 1) return [];
  if (!isObjectArray(data)) return [];
  const hasCoords = data.every(
    (row) =>
      (("lat" in row && "lon" in row) ||
        ("latitude" in row && "longitude" in row))
  );
  if (hasCoords) {
    return [
      {
        view: "map",
        confidence: 0.85,
        reason: "Array of objects with lat/lon coordinates",
      },
    ];
  }
  return [];
};

/** Explicit tabular: {columns, rows}. */
const matchExplicitTable: Matcher = (data) => {
  if (!isPlainObject(data)) return [];
  if (Array.isArray(data.columns) && Array.isArray(data.rows)) {
    return [
      {
        view: "datatable",
        confidence: 0.95,
        reason: "Object has columns + rows arrays",
      },
    ];
  }
  return [];
};

/** Uniform array of objects → datatable (+ chart if numeric-heavy). */
const matchTabularArray: Matcher = (data) => {
  if (!isTabular(data)) return [];
  const rows = data as Record<string, unknown>[];
  const suggestions: ViewSuggestion[] = [
    {
      view: "datatable",
      confidence: 0.80,
      reason: `Array of ${rows.length} uniform objects`,
    },
  ];
  if (isNumericHeavy(rows)) {
    suggestions.push({
      view: "chart",
      confidence: 0.60,
      reason: "Rows are mostly numeric — could render as a chart",
    });
  }
  return suggestions;
};

/** Single numeric value → counter. */
const matchCounter: Matcher = (data) => {
  if (isNumber(data)) {
    return [
      { view: "counter", confidence: 0.85, reason: "Data is a single number" },
    ];
  }
  if (isPlainObject(data) && isNumber(data.value)) {
    const keys = Object.keys(data);
    // Heuristic: a small object whose primary payload is a number
    if (keys.length <= 4) {
      return [
        {
          view: "counter",
          confidence: 0.90,
          reason: "Object with a numeric value field",
        },
      ];
    }
  }
  return [];
};

/** Time-series array. */
const matchTimeSeries: Matcher = (data) => {
  if (isTimeSeries(data)) {
    return [
      {
        view: "timeseries",
        confidence: 0.85,
        reason: "Array of time-indexed objects with numeric values",
      },
    ];
  }
  return [];
};

/** Timeline: array with date key + title/label/event. */
const matchTimeline: Matcher = (data) => {
  if (!Array.isArray(data) || data.length < 2) return [];
  if (!isObjectArray(data)) return [];
  if (!hasDateKey(data[0])) return [];
  const labelKeys = /^(title|label|event|name|description)$/i;
  const hasLabel = Object.keys(data[0]).some((k) => labelKeys.test(k));
  if (hasLabel) {
    return [
      {
        view: "timeline",
        confidence: 0.85,
        reason: "Array of objects with date + label/title fields",
      },
    ];
  }
  return [];
};

/** Hierarchical tree (children-based). */
const matchTreeChildren: Matcher = (data) => {
  if (isPlainObject(data) && Array.isArray(data.children)) {
    return [
      {
        view: "tree",
        confidence: 0.90,
        reason: "Object has a recursive children array",
      },
    ];
  }
  return [];
};

/** Hierarchical via parent/parentId. */
const matchTreeParent: Matcher = (data) => {
  if (
    Array.isArray(data) &&
    isObjectArray(data) &&
    data.length >= 2 &&
    data.every((row) => "parent" in row || "parentId" in row)
  ) {
    return [
      {
        view: "tree",
        confidence: 0.85,
        reason: "Array of objects with parent/parentId references",
      },
    ];
  }
  return [];
};

/** Graph: nodes + edges/links. */
const matchGraph: Matcher = (data) => {
  if (!isPlainObject(data)) return [];
  if (!Array.isArray(data.nodes)) return [];
  if (Array.isArray(data.edges) || Array.isArray(data.links)) {
    return [
      {
        view: "graph",
        confidence: 0.90,
        reason: "Object has nodes + edges/links arrays",
      },
    ];
  }
  return [];
};

/** Flowchart: nodes + edges with positions or types. */
const matchFlowchart: Matcher = (data) => {
  if (!isPlainObject(data)) return [];
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) return [];
  const nodes = data.nodes as unknown[];
  if (!isObjectArray(nodes)) return [];
  const hasPositions = nodes.some(
    (n) => "position" in n || ("x" in n && "y" in n)
  );
  const hasTypes = nodes.some((n) => "type" in n);
  if (hasPositions || hasTypes) {
    return [
      {
        view: "flowchart",
        confidence: 0.85,
        reason: "Object has nodes with positions/types + edges",
      },
    ];
  }
  return [];
};

/** Sankey: nodes + links with numeric value (flows). */
const matchSankey: Matcher = (data) => {
  if (!isPlainObject(data)) return [];
  if (!Array.isArray(data.nodes) || !Array.isArray(data.links)) return [];
  const links = data.links as unknown[];
  if (!isObjectArray(links)) return [];
  const hasValues = links.some((l) => isNumber(l.value));
  if (hasValues) {
    return [
      {
        view: "sankey",
        confidence: 0.85,
        reason: "Object has nodes + links with numeric values (flow data)",
      },
    ];
  }
  return [];
};

/** Code block: {language, code/source}. */
const matchCode: Matcher = (data) => {
  if (!isPlainObject(data)) return [];
  if (isStr(data.language) && (isStr(data.code) || isStr(data.source))) {
    return [
      {
        view: "code",
        confidence: 0.95,
        reason: "Object has language + code/source fields",
      },
    ];
  }
  return [];
};

/** Markdown string. */
const matchMarkdown: Matcher = (data) => {
  if (!isStr(data)) return [];
  const mdIndicators = /(?:^#{1,6}\s|```|^\*\s|\[.+\]\(.+\)|^\|.+\|)/m;
  if (mdIndicators.test(data)) {
    return [
      {
        view: "markdown",
        confidence: 0.90,
        reason: "String contains markdown indicators (headers, code blocks, links)",
      },
    ];
  }
  // Plain string falls back to markdown at lower confidence
  return [
    {
      view: "markdown",
      confidence: 0.70,
      reason: "Plain string — renderable as markdown",
    },
  ];
};

/** Media URL detection. */
const matchMedia: Matcher = (data) => {
  if (!isPlainObject(data) || !isStr(data.url)) return [];
  const url = data.url.toLowerCase().split("?")[0]; // strip query params

  const imageExts = /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico|avif)$/;
  const videoExts = /\.(mp4|webm|mov|avi|mkv)$/;
  const audioExts = /\.(mp3|wav|ogg|aac|flac|m4a)$/;
  const pdfExt = /\.pdf$/;

  if (imageExts.test(url)) {
    return [
      { view: "image", confidence: 0.90, reason: "URL ends with an image extension" },
    ];
  }
  if (videoExts.test(url)) {
    return [
      { view: "video", confidence: 0.90, reason: "URL ends with a video extension" },
    ];
  }
  if (audioExts.test(url)) {
    return [
      { view: "audio", confidence: 0.90, reason: "URL ends with an audio extension" },
    ];
  }
  if (pdfExt.test(url)) {
    return [
      { view: "pdf", confidence: 0.90, reason: "URL ends with .pdf" },
    ];
  }
  return [];
};

/** Detail: object with fields array of {label, value}. */
const matchDetailFields: Matcher = (data) => {
  if (!isPlainObject(data)) return [];
  if (!Array.isArray(data.fields)) return [];
  const fields = data.fields as unknown[];
  if (
    isObjectArray(fields) &&
    fields.every((f) => "label" in f && "value" in f)
  ) {
    return [
      {
        view: "detail",
        confidence: 0.90,
        reason: "Object has fields array of {label, value} pairs",
      },
    ];
  }
  return [];
};

/** Detail: flat object with all scalar values (no arrays). */
const matchDetailScalar: Matcher = (data) => {
  if (!isPlainObject(data)) return [];
  const values = Object.values(data);
  if (values.length === 0) return [];
  const allScalar = values.every(
    (v) =>
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean" ||
      v === null
  );
  const hasArrays = values.some(Array.isArray);
  if (allScalar && !hasArrays) {
    return [
      {
        view: "detail",
        confidence: 0.75,
        reason: "Object with all scalar values (key-value pairs)",
      },
    ];
  }
  return [];
};

/** Status: array of objects with status/state + label/name. */
const matchStatus: Matcher = (data) => {
  if (!Array.isArray(data) || data.length < 1) return [];
  if (!isObjectArray(data)) return [];
  const hasStatus = data.every(
    (row) =>
      ("status" in row || "state" in row) &&
      ("label" in row || "name" in row)
  );
  if (hasStatus) {
    return [
      {
        view: "status",
        confidence: 0.85,
        reason: "Array of objects with status/state + label/name fields",
      },
    ];
  }
  return [];
};

/** Stepper: object with steps array containing status fields. */
const matchStepper: Matcher = (data) => {
  if (!isPlainObject(data)) return [];
  if (!Array.isArray(data.steps)) return [];
  const steps = data.steps as unknown[];
  if (
    isObjectArray(steps) &&
    steps.every((s) => "status" in s || "state" in s)
  ) {
    return [
      {
        view: "stepper",
        confidence: 0.85,
        reason: "Object has steps array with status fields",
      },
    ];
  }
  return [];
};

/** Fallback: unknown object or array → json viewer. */
const matchFallback: Matcher = (data) => {
  if (isPlainObject(data) || Array.isArray(data)) {
    return [
      {
        view: "json",
        confidence: 0.30,
        reason: "Fallback — data can be rendered as raw JSON",
      },
    ];
  }
  return [];
};

// ---------------------------------------------------------------------------
// Matcher pipeline — ordered from most specific to least specific.
//
// The ordering matters: structuredContent is checked first (exact match),
// then high-specificity patterns (GeoJSON, code, explicit table), then
// progressively looser patterns, and finally the json fallback.
// ---------------------------------------------------------------------------

const MATCHERS: Matcher[] = [
  // Exact match
  matchStructuredContent,
  // Spatial / geo
  matchGeoJSON,
  matchMapCenterLayers,
  matchMapCenterMarkers,
  matchLatLonArray,
  // Code (before markdown, since code objects are very specific)
  matchCode,
  // Media
  matchMedia,
  // Tabular (explicit)
  matchExplicitTable,
  // Detail (fields array — specific shape, before generic scalar check)
  matchDetailFields,
  // Stepper (before status, since it's more specific)
  matchStepper,
  // Flow
  matchFlowchart,
  matchSankey,
  // Graph / hierarchy
  matchGraph,
  matchTreeChildren,
  matchTreeParent,
  // Counter
  matchCounter,
  // Time-based (before generic tabular to prioritise temporal patterns)
  matchTimeSeries,
  matchTimeline,
  // Status
  matchStatus,
  // Tabular (inferred from uniform array)
  matchTabularArray,
  // Text
  matchMarkdown,
  // Detail (flat scalar object — low specificity)
  matchDetailScalar,
  // Fallback
  matchFallback,
];

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Analyze an unknown data object and return ranked suggestions for
 * which chuk view would best render it.
 *
 * @param data - The data payload to analyze. Can be any JSON-compatible value.
 * @returns An array of {@link ViewSuggestion} objects sorted by confidence
 *          (highest first). Typically contains 1-3 entries.
 *
 * @example
 * ```ts
 * import { inferView } from "@chuk/view-shared/server";
 *
 * const suggestions = inferView({ type: "FeatureCollection", features: [] });
 * // [{ view: "map", confidence: 0.95, reason: "Data is a GeoJSON FeatureCollection" }]
 * ```
 */
export function inferView(data: unknown): ViewSuggestion[] {
  // Collect all suggestions from every matcher.
  const suggestions: ViewSuggestion[] = [];

  for (const matcher of MATCHERS) {
    const results = matcher(data);
    if (results.length > 0) {
      suggestions.push(...results);
    }
  }

  // If structuredContent matched (confidence 1.0), return only that.
  const exact = suggestions.find((s) => s.confidence === 1.0);
  if (exact) return [exact];

  // Deduplicate: keep the highest-confidence entry per view name.
  const best = new Map<string, ViewSuggestion>();
  for (const s of suggestions) {
    const existing = best.get(s.view);
    if (!existing || s.confidence > existing.confidence) {
      best.set(s.view, s);
    }
  }

  // Sort descending by confidence, then alphabetically by view name for ties.
  return Array.from(best.values()).sort(
    (a, b) => b.confidence - a.confidence || a.view.localeCompare(b.view)
  );
}
