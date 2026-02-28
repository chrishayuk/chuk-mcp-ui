/**
 * FontContent — font glyph view schema.
 *
 * Matches the Python FontContent Pydantic model in chuk-view-schemas/font.py.
 * Paths are in font coordinate space (y-up, origin at baseline).
 * The React component applies `translate(0, ascender) scale(1, -1)` to flip
 * y-axis into screen space.
 */

export interface FontContour {
  /** SVG path `d` string in font coordinates (y increases upward). */
  d: string;
}

export interface FontGlyph {
  name: string;
  contours: FontContour[];
  advance_width: number;

  /** Typographic metrics in font units. */
  upm: number;
  ascender: number;
  descender: number;
  cap_height: number;
  x_height: number;

  /** Axis param labels for display. */
  sqar?: number;
  trap?: number;
  weight?: number;
}

export interface FontContent {
  type: "font";
  version: "1.0";
  title?: string;
  glyphs: FontGlyph[];
  show_metrics?: boolean;
}
