/**
 * Server-side helpers for registering chuk View tools.
 *
 * Import from "@chuk/view-shared/server" — this is a separate entry
 * point that does NOT get bundled into client-side View code.
 */

const CDN_BASE = "https://chuk-mcp-ui-views.fly.dev";

const VIEW_PATHS: Record<string, string> = {
  alert: "/alert/v1",
  audio: "/audio/v1",
  boxplot: "/boxplot/v1",
  carousel: "/carousel/v1",
  chart: "/chart/v1",
  chat: "/chat/v1",
  code: "/code/v1",
  compare: "/compare/v1",
  confirm: "/confirm/v1",
  counter: "/counter/v1",
  crosstab: "/crosstab/v1",
  dashboard: "/dashboard/v1",
  datatable: "/datatable/v1",
  detail: "/detail/v1",
  diff: "/diff/v1",
  embed: "/embed/v1",
  filter: "/filter/v1",
  form: "/form/v1",
  gallery: "/gallery/v1",
  gauge: "/gauge/v1",
  "gis-legend": "/gis-legend/v1",
  heatmap: "/heatmap/v1",
  image: "/image/v1",
  json: "/json/v1",
  kanban: "/kanban/v1",
  layers: "/layers/v1",
  log: "/log/v1",
  map: "/map/v1",
  markdown: "/markdown/v1",
  minimap: "/minimap/v1",
  pdf: "/pdf/v1",
  pivot: "/pivot/v1",
  poll: "/poll/v1",
  profile: "/profile/v1",
  progress: "/progress/v1",
  quiz: "/quiz/v1",
  ranked: "/ranked/v1",
  scatter: "/scatter/v1",
  settings: "/settings/v1",
  spectrogram: "/spectrogram/v1",
  split: "/split/v1",
  status: "/status/v1",
  stepper: "/stepper/v1",
  sunburst: "/sunburst/v1",
  tabs: "/tabs/v1",
  terminal: "/terminal/v1",
  timeline: "/timeline/v1",
  timeseries: "/timeseries/v1",
  tree: "/tree/v1",
  treemap: "/treemap/v1",
  video: "/video/v1",
};

export interface ViewToolResult {
  structuredContent: Record<string, unknown>;
  content?: Array<{ type: string; text?: string }>;
}

export interface RegisterViewToolOptions {
  title?: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  cdnBase?: string | null;
  viewHtml?: string;
}

/**
 * Get the CDN URL for a View type.
 */
export function getViewUrl(
  viewType: string,
  cdnBase: string = CDN_BASE
): string {
  const path = VIEW_PATHS[viewType] ?? `/${viewType}/v1`;
  return `${cdnBase}${path}`;
}

/**
 * Build the meta object for an MCP tool that renders a View.
 */
export function buildViewMeta(
  viewType: string,
  cdnBase: string = CDN_BASE
): { ui: { resourceUri: string } } {
  return {
    ui: {
      resourceUri: getViewUrl(viewType, cdnBase),
    },
  };
}

/**
 * Wrap a handler's result in the standard MCP tool result envelope.
 */
export function wrapViewResult(
  viewType: string,
  result: ViewToolResult
): {
  content: Array<{ type: string; text?: string }>;
  structuredContent: Record<string, unknown>;
} {
  const content = result.content ?? [
    { type: "text", text: `Showing ${viewType} view.` },
  ];

  return {
    content,
    structuredContent: result.structuredContent,
  };
}

export { CDN_BASE, VIEW_PATHS };
