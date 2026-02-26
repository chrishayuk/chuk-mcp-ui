/**
 * SSR Compose Engine.
 *
 * Takes a layout description with multiple data sections, infers or uses
 * explicit view types, SSR-renders each panel, and assembles a complete
 * HTML page with CSS grid/flex layout. Optionally includes hydration
 * scripts for client-side interactivity.
 */
import type { LayoutConfig, PanelV2, CrossViewLink } from "@apps/dashboard/src/schema";
import { resolveLayout } from "@apps/dashboard/src/auto-layout";
import { inferView, type ViewSuggestion } from "@chuk/view-shared/server";
import { render } from "./ssr-entry";
import { layoutToContainerStyle, panelStyle } from "./layout-css";
import {
  propagateState,
  type ComposeInitialState,
  type PanelOverlay,
} from "./state-propagation";

// ── Browser-dependent views (use placeholder SSR) ───────────────────
const PLACEHOLDER_VIEWS = new Set([
  "chart", "map", "minimap", "layers",
  "profile", "scatter", "timeseries",
  "pdf", "shader",
]);

// ── Public types ────────────────────────────────────────────────────

export interface ComposeSection {
  /** Unique panel identifier */
  id: string;
  /** Explicit view name. Omit to auto-infer from data. */
  view?: string;
  /** structuredContent for the view */
  data: unknown;
  /** Optional panel label */
  label?: string;
  /** Priority for auto-layout ordering (lower = more important) */
  priority?: number;
}

export interface ComposeRequest {
  /** Data sections to compose into a single page */
  sections: ComposeSection[];
  /** Layout strategy. Defaults to "auto". */
  layout?: LayoutConfig;
  /** Page title */
  title?: string;
  /** CSS gap between panels. Defaults to "12px". */
  gap?: string;
  /** Theme. Defaults to "light". */
  theme?: "light" | "dark";
  /** Cross-view links for state propagation */
  links?: CrossViewLink[];
  /** Initial cross-view state (selections, filters, highlights) */
  initialState?: ComposeInitialState;
  /** Whether to include client hydration scripts */
  hydrate?: boolean;
}

export interface ComposeSectionResult {
  id: string;
  /** Resolved view name */
  view: string;
  /** Whether the view was auto-inferred */
  inferred: boolean;
  /** Inference confidence (0-1), only when inferred */
  confidence?: number;
  /** Inference explanation, only when inferred */
  reason?: string;
}

export interface ComposeResult {
  /** Complete composed HTML page */
  html: string;
  /** Metadata about each rendered section */
  sections: ComposeSectionResult[];
}

export interface InferResult {
  index: number;
  suggestions: ViewSuggestion[];
}

// Re-export for consumers
export type { ComposeInitialState, PanelOverlay };

// ── Compose ─────────────────────────────────────────────────────────

/**
 * Compose multiple views into a single SSR HTML page.
 */
export function compose(request: ComposeRequest): ComposeResult {
  const {
    sections,
    layout: layoutConfig = "auto",
    title,
    gap = "12px",
    theme = "light",
    links,
    initialState,
    hydrate = false,
  } = request;

  if (!sections || sections.length === 0) {
    throw new Error("ComposeRequest must have at least one section");
  }

  // 1. Resolve view for each section
  const resolved: Array<{
    section: ComposeSection;
    view: string;
    inferred: boolean;
    confidence?: number;
    reason?: string;
  }> = [];

  for (const section of sections) {
    if (section.view) {
      resolved.push({
        section,
        view: section.view,
        inferred: false,
      });
    } else {
      const suggestions = inferView(section.data);
      if (suggestions.length === 0) {
        resolved.push({
          section,
          view: "json",
          inferred: true,
          confidence: 0,
          reason: "No matching view found, falling back to JSON",
        });
      } else {
        const best = suggestions[0];
        resolved.push({
          section,
          view: best.view,
          inferred: true,
          confidence: best.confidence,
          reason: best.reason,
        });
      }
    }
  }

  // 2. Propagate cross-view state
  const overlays = propagateState(sections, links, initialState);

  // 3. Build PanelV2[] for layout computation
  const panels: PanelV2[] = resolved.map((r) => ({
    id: r.section.id,
    label: r.section.label,
    viewType: r.view,
    structuredContent: r.section.data,
    priority: r.section.priority,
  }));

  // 4. Resolve layout
  const resolvedLayout = resolveLayout(layoutConfig, panels);

  // 5. Build CSS
  const containerCss = layoutToContainerStyle(resolvedLayout, gap);

  // 6. Render each section
  const panelHtmls: string[] = [];
  for (const r of resolved) {
    // Augment data with compose overlay if present
    const overlay = overlays.get(r.section.id);
    const renderData = overlay
      ? augmentData(r.section.data, overlay, r.section.id)
      : r.section.data;

    let inner: string;
    try {
      inner = render(r.view, renderData);
    } catch {
      inner = `<div style="padding:16px;color:#ef4444">Failed to render ${r.view} view</div>`;
    }

    const pCss = panelStyle(resolvedLayout, r.section.id);
    const labelHtml = r.section.label
      ? `<div style="padding:6px 12px;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;background:#f9fafb">${escapeHtml(r.section.label)}</div>`
      : "";

    const isPlaceholder = PLACEHOLDER_VIEWS.has(r.view);
    const placeholderAttr = isPlaceholder ? " data-ssr-placeholder" : "";

    panelHtmls.push(
      `<div data-panel="${escapeHtml(r.section.id)}" data-view="${escapeHtml(r.view)}"${placeholderAttr} style="${pCss}">${labelHtml}${inner}</div>`
    );
  }

  // 7. Assemble full page
  const titleHtml = title
    ? `<div style="padding:12px 16px;font-size:18px;font-weight:700;border-bottom:1px solid #e5e7eb">${escapeHtml(title)}</div>`
    : "";

  const themeClass = theme === "dark" ? "dark" : "";

  // 8. Build hydration scripts if requested
  let hydrationScripts = "";
  if (hydrate) {
    const composeState = {
      sections: resolved.map((r) => ({
        id: r.section.id,
        view: r.view,
        data: r.section.data,
      })),
      links: links ?? [],
      initialState: initialState ?? {},
    };
    const stateJson = JSON.stringify(composeState).replace(/</g, "\\u003c");
    hydrationScripts = `
<script>window.__COMPOSE_STATE__=${stateJson}</script>
<script type="module" src="/compose/client.js"></script>`;
  }

  const html = `<!DOCTYPE html>
<html lang="en" class="${themeClass}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(title ?? "Composed View")}</title>
<style>
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;height:100%;font-family:system-ui,-apple-system,sans-serif}
.dark{background:#0a0a0a;color:#fafafa}
</style>
</head>
<body>
${titleHtml}
<div style="${containerCss}">
${panelHtmls.join("\n")}
</div>${hydrationScripts}
</body>
</html>`;

  // 9. Build result metadata
  const sectionResults: ComposeSectionResult[] = resolved.map((r) => ({
    id: r.section.id,
    view: r.view,
    inferred: r.inferred,
    ...(r.confidence !== undefined ? { confidence: r.confidence } : {}),
    ...(r.reason !== undefined ? { reason: r.reason } : {}),
  }));

  return { html, sections: sectionResults };
}

// ── Infer ───────────────────────────────────────────────────────────

/**
 * Run view inference on an array of data objects.
 */
export function infer(data: unknown[]): InferResult[] {
  return data.map((d, index) => ({
    index,
    suggestions: inferView(d),
  }));
}

// ── Helpers ─────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Augment view data with compose overlay metadata.
 * Renderers can optionally read `data._compose` for cross-view state.
 */
function augmentData(
  data: unknown,
  overlay: PanelOverlay,
  panelId: string,
): unknown {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return data;
  }
  return {
    ...(data as Record<string, unknown>),
    _compose: {
      panelId,
      ...(overlay.selectedIds ? { selectedIds: overlay.selectedIds } : {}),
      ...(overlay.filters ? { filters: overlay.filters } : {}),
      ...(overlay.highlightedId ? { highlightedId: overlay.highlightedId } : {}),
    },
  };
}
