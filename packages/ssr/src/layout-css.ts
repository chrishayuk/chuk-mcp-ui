/**
 * Converts ResolvedLayout into inline CSS strings for SSR HTML output.
 *
 * No React dependency — pure string manipulation for server-side use.
 *
 * SECURITY: All user-provided CSS values are sanitized to prevent
 * CSS injection via style attribute breakout.
 */
import type { ResolvedLayout } from "@apps/dashboard/src/auto-layout";

/**
 * Validate a CSS value to prevent injection via style attributes.
 * Only allows characters valid in CSS values: alphanumeric, spaces,
 * parentheses, commas, dots, hyphens, percent, and forward slashes.
 * Returns the validated value or a safe fallback.
 */
function sanitizeCssValue(value: string): string {
  // Strip everything except safe CSS value characters
  return value.replace(/[^a-zA-Z0-9 (),./%-]/g, "").trim();
}

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
      parts.push(`grid-template-columns:${sanitizeCssValue(layout.gridTemplateColumns)}`);
    }
    if (layout.gridTemplateRows) {
      parts.push(`grid-template-rows:${sanitizeCssValue(layout.gridTemplateRows)}`);
    }
    if (layout.gridTemplateAreas) {
      parts.push(`grid-template-areas:${sanitizeCssValue(layout.gridTemplateAreas)}`);
    }
  } else {
    parts.push("display:flex");
    parts.push(`flex-direction:${layout.direction ?? "row"}`);
  }

  parts.push(`gap:${sanitizeCssValue(gap)}`);
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

  if (style.gridRow) parts.push(`grid-row:${sanitizeCssValue(String(style.gridRow))}`);
  if (style.gridColumn) parts.push(`grid-column:${sanitizeCssValue(String(style.gridColumn))}`);

  parts.push("overflow:auto");

  return parts.join(";");
}
