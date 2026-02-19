/**
 * Server-side helpers for registering chuk View tools.
 *
 * Import from "@chuk/view-shared/server" — this is a separate entry
 * point that does NOT get bundled into client-side View code.
 */

const CDN_BASE = "https://chuk-mcp-ui-views.fly.dev";

const VIEW_PATHS: Record<string, string> = {
  map: "/map/v1",
  chart: "/chart/v1",
  datatable: "/datatable/v1",
  form: "/form/v1",
  markdown: "/markdown/v1",
  video: "/video/v1",
  pdf: "/pdf/v1",
  dashboard: "/dashboard/v1",
  split: "/split/v1",
  tabs: "/tabs/v1",
  detail: "/detail/v1",
  counter: "/counter/v1",
  code: "/code/v1",
  progress: "/progress/v1",
  confirm: "/confirm/v1",
  json: "/json/v1",
  status: "/status/v1",
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
