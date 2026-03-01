/**
 * Server-side helpers for registering chuk View tools.
 *
 * Import from "@chuk/view-shared/server" — this is a separate entry
 * point that does NOT get bundled into client-side View code.
 */

import { CDN_ORIGIN } from "../constants";
import { ALL_VIEWS, VIEW_ALIASES } from "../manifest";

const CDN_BASE = CDN_ORIGIN;

// Generate VIEW_PATHS from the shared manifest + aliases
const VIEW_PATHS: Record<string, string> = Object.fromEntries([
  ...ALL_VIEWS.map((v) => [v, `/${v}/v1`]),
  ...Object.entries(VIEW_ALIASES).map(([alias, target]) => [alias, `/${target}/v1`]),
]);

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

export { inferView } from "./infer";
export type { ViewSuggestion } from "./infer";
