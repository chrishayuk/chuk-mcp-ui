import { useView } from "@chuk/view-shared";
import { ScrollArea } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { listContainer, listItem } from "@chuk/view-ui/animations";
import type { FontContent, FontGlyph } from "./schema";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CHUK_TEAL = "#00B4D8";
const BACKGROUND_DARK = "#1a1a2e";
const GUIDE_FAINT = "rgba(255,255,255,0.12)";
const GUIDE_BASELINE = "rgba(255,255,255,0.35)";
const GUIDE_METRIC = "rgba(255,255,255,0.20)";

/* ------------------------------------------------------------------ */
/*  FontView — connected wrapper                                       */
/* ------------------------------------------------------------------ */

export function FontView() {
  const { data } = useView<FontContent>("font", "1.0");
  if (!data) return null;
  return <FontRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  FontRenderer — pure presentation                                  */
/* ------------------------------------------------------------------ */

interface FontRendererProps {
  data: FontContent;
}

export function FontRenderer({ data }: FontRendererProps) {
  const { title, glyphs, show_metrics = true } = data;
  const isSingle = glyphs.length === 1;

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      {/* Toolbar */}
      {title && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
          <h1 className="text-base font-semibold">{title}</h1>
          {glyphs.length > 1 && (
            <span className="ml-auto text-xs text-muted-foreground">
              {glyphs.length} glyphs
            </span>
          )}
        </div>
      )}

      {/* Main content */}
      <ScrollArea className="flex-1">
        {isSingle ? (
          <SingleGlyphLayout glyph={glyphs[0]} showMetrics={show_metrics} />
        ) : (
          <ProofSheetLayout glyphs={glyphs} showMetrics={show_metrics} />
        )}
      </ScrollArea>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single glyph layout                                               */
/* ------------------------------------------------------------------ */

function SingleGlyphLayout({
  glyph,
  showMetrics,
}: {
  glyph: FontGlyph;
  showMetrics: boolean;
}) {
  const { name, sqar, trap, weight } = glyph;

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <div style={{ width: "min(100%, 360px)" }}>
        <GlyphSvg glyph={glyph} showMetrics={showMetrics} />
      </div>
      <div className="text-center space-y-1">
        <div className="text-2xl font-mono font-bold">{name}</div>
        {(sqar !== undefined || weight !== undefined || trap !== undefined) && (
          <div className="text-xs text-muted-foreground space-x-3">
            {sqar !== undefined && <span>SQAR {sqar}</span>}
            {trap !== undefined && <span>TRAP {trap}</span>}
            {weight !== undefined && <span>wght {weight}</span>}
            <span>w {glyph.advance_width}u</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Proof sheet layout (grid)                                         */
/* ------------------------------------------------------------------ */

function ProofSheetLayout({
  glyphs,
  showMetrics,
}: {
  glyphs: FontGlyph[];
  showMetrics: boolean;
}) {
  return (
    <motion.div
      variants={listContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-3 p-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}
    >
      {glyphs.map((glyph) => (
        <motion.div key={glyph.name} variants={listItem}>
          <GlyphCell glyph={glyph} showMetrics={showMetrics} />
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  GlyphCell — compact grid cell                                     */
/* ------------------------------------------------------------------ */

function GlyphCell({
  glyph,
  showMetrics,
}: {
  glyph: FontGlyph;
  showMetrics: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-full rounded overflow-hidden"
        style={{ background: BACKGROUND_DARK }}
      >
        <GlyphSvg glyph={glyph} showMetrics={showMetrics} compact />
      </div>
      <div className="text-xs font-mono font-semibold text-center">
        {glyph.name}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  GlyphSvg — the core SVG renderer                                 */
/* ------------------------------------------------------------------ */

interface GlyphSvgProps {
  glyph: FontGlyph;
  showMetrics: boolean;
  compact?: boolean;
}

function GlyphSvg({ glyph, showMetrics, compact = false }: GlyphSvgProps) {
  const {
    contours,
    advance_width,
    upm,
    ascender,
    descender,
    cap_height,
    x_height,
  } = glyph;

  // ViewBox: advance_width × upm (= ascender - descender = 1000)
  // Small side margin so strokes at edge aren't clipped.
  const margin = Math.round(advance_width * 0.06);
  const viewW = advance_width + margin * 2;
  const viewH = upm; // ascender - descender

  // Guide line y-positions in screen space.
  // After the y-flip transform (translate(0, ascender) scale(1,-1)),
  // a font y-value maps to screen y = ascender - y_font.
  const yScreen = (yFont: number) => ascender - yFont;

  const baselineY = yScreen(0);          // baseline
  const xHeightY  = yScreen(x_height);   // x-height
  const capY      = yScreen(cap_height); // cap-height
  const ascY      = yScreen(ascender);   // ascender top  = 0
  const descY     = yScreen(descender);  // descender bottom = upm

  const guideLeft  = -margin;
  const guideRight = advance_width + margin;

  return (
    <svg
      viewBox={`${-margin} 0 ${viewW} ${viewH}`}
      width="100%"
      style={{ display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background */}
      <rect
        x={-margin}
        y={0}
        width={viewW}
        height={viewH}
        fill={BACKGROUND_DARK}
      />

      {/* Typographic guide lines */}
      {showMetrics && (
        <g>
          {/* Descender */}
          {!compact && (
            <line
              x1={guideLeft} y1={descY}
              x2={guideRight} y2={descY}
              stroke={GUIDE_FAINT} strokeWidth={0.6}
            />
          )}
          {/* Ascender top */}
          {!compact && (
            <line
              x1={guideLeft} y1={ascY}
              x2={guideRight} y2={ascY}
              stroke={GUIDE_FAINT} strokeWidth={0.6}
            />
          )}
          {/* Cap height */}
          <line
            x1={guideLeft} y1={capY}
            x2={guideRight} y2={capY}
            stroke={GUIDE_METRIC} strokeWidth={0.6}
            strokeDasharray="3 5"
          />
          {/* X-height */}
          <line
            x1={guideLeft} y1={xHeightY}
            x2={guideRight} y2={xHeightY}
            stroke={GUIDE_METRIC} strokeWidth={0.6}
            strokeDasharray="3 5"
          />
          {/* Baseline — most prominent guide */}
          <line
            x1={guideLeft} y1={baselineY}
            x2={guideRight} y2={baselineY}
            stroke={GUIDE_BASELINE} strokeWidth={1}
          />
          {/* Left sidebearing */}
          <line
            x1={0} y1={0}
            x2={0} y2={viewH}
            stroke={GUIDE_FAINT} strokeWidth={0.5}
          />
          {/* Right sidebearing (advance width) */}
          <line
            x1={advance_width} y1={0}
            x2={advance_width} y2={viewH}
            stroke={GUIDE_FAINT} strokeWidth={0.5}
          />
        </g>
      )}

      {/* Glyph outlines — y-flipped from font coords to screen coords */}
      <g transform={`translate(0, ${ascender}) scale(1, -1)`}>
        {contours.map((c, i) => (
          <path
            key={i}
            d={c.d}
            fill={CHUK_TEAL}
            fillOpacity={0.9}
            fillRule="evenodd"
          />
        ))}
      </g>
    </svg>
  );
}
