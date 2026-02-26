/**
 * Converts ResolvedLayout into inline CSS strings for SSR HTML output.
 *
 * No React dependency — pure string manipulation for server-side use.
 */
import type { ResolvedLayout } from "@apps/dashboard/src/auto-layout";

/**
 * Generate CSS for the grid/flex container element.
 */
export function layoutToContainerStyle(
  layout: ResolvedLayout,
  gap = "12px",
): string {
  const parts: string[] = [];

  if (layout.display === "grid") {
    parts.push("display:grid");
    if (layout.gridTemplateColumns) {
      parts.push(`grid-template-columns:${layout.gridTemplateColumns}`);
    }
    if (layout.gridTemplateRows) {
      parts.push(`grid-template-rows:${layout.gridTemplateRows}`);
    }
    if (layout.gridTemplateAreas) {
      parts.push(`grid-template-areas:${layout.gridTemplateAreas}`);
    }
  } else {
    parts.push("display:flex");
    parts.push(`flex-direction:${layout.direction ?? "row"}`);
  }

  parts.push(`gap:${gap}`);
  parts.push("width:100%");
  parts.push("height:100%");

  return parts.join(";");
}

/**
 * Generate per-panel CSS from the layout's panelStyles Map.
 * Returns empty string if no specific style exists for this panel.
 */
export function panelStyle(
  layout: ResolvedLayout,
  panelId: string,
): string {
  const style = layout.panelStyles.get(panelId);
  if (!style) {
    // For flex layouts, each panel gets flex:1 by default
    if (layout.display === "flex") {
      return "flex:1;min-width:0;min-height:0;overflow:auto";
    }
    return "overflow:auto";
  }

  const parts: string[] = [];

  if (style.gridRow) parts.push(`grid-row:${style.gridRow}`);
  if (style.gridColumn) parts.push(`grid-column:${style.gridColumn}`);

  parts.push("overflow:auto");

  return parts.join(";");
}
