import { useMemo, useState } from "react";
import { useView } from "@chuk/view-shared";
import {
  Card,
  CardContent,
  ScrollArea,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  cn,
} from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { HeatmapContent, HeatmapAnnotation } from "./schema";

/* ------------------------------------------------------------------ */
/*  View wrapper (postMessage / useView)                              */
/* ------------------------------------------------------------------ */

export function HeatmapView() {
  const { data } =
    useView<HeatmapContent>("heatmap", "1.0");

  if (!data) return null;

  return <HeatmapRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                    */
/* ------------------------------------------------------------------ */

export interface HeatmapRendererProps {
  data: HeatmapContent;
}

/* ------------------------------------------------------------------ */
/*  Colour helpers                                                    */
/* ------------------------------------------------------------------ */

function parseHexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
  ];
}

function rgbToString(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function interpolateColor(
  t: number,
  colorScale: "sequential" | "diverging",
  minColor: string,
  maxColor: string,
  midColor: string,
): string {
  const minRgb = parseHexToRgb(minColor);
  const maxRgb = parseHexToRgb(maxColor);

  if (colorScale === "diverging") {
    const midRgb = parseHexToRgb(midColor);
    if (t <= 0.5) {
      return rgbToString(lerpColor(minRgb, midRgb, t * 2));
    }
    return rgbToString(lerpColor(midRgb, maxRgb, (t - 0.5) * 2));
  }

  return rgbToString(lerpColor(minRgb, maxRgb, t));
}

/**
 * Compute perceived brightness (0-255) using the standard luminance formula.
 * Returns true when text on this background should be white.
 */
function shouldUseWhiteText(bgHex: string): boolean;
function shouldUseWhiteText(r: number, g: number, b: number): boolean;
function shouldUseWhiteText(
  rOrHex: string | number,
  g?: number,
  b?: number,
): boolean {
  let r: number;
  let gVal: number;
  let bVal: number;

  if (typeof rOrHex === "string") {
    const rgb = parseHexToRgb(rOrHex);
    r = rgb[0];
    gVal = rgb[1];
    bVal = rgb[2];
  } else {
    r = rOrHex;
    gVal = g!;
    bVal = b!;
  }

  const brightness = (r * 299 + gVal * 587 + bVal * 114) / 1000;
  return brightness < 128;
}

function getTextColorForBg(bgRgbString: string): string {
  const match = bgRgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return "#1e293b";
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  return shouldUseWhiteText(r, g, b) ? "#ffffff" : "#1e293b";
}

/* ------------------------------------------------------------------ */
/*  Annotation lookup                                                 */
/* ------------------------------------------------------------------ */

function findAnnotation(
  annotations: HeatmapAnnotation[] | undefined,
  row: number,
  col: number,
): HeatmapAnnotation | undefined {
  return annotations?.find((a) => a.row === row && a.col === col);
}

/* ------------------------------------------------------------------ */
/*  Colour legend                                                     */
/* ------------------------------------------------------------------ */

function ColorLegend({
  minVal,
  maxVal,
  colorScale,
  minColor,
  maxColor,
  midColor,
}: {
  minVal: number;
  maxVal: number;
  colorScale: "sequential" | "diverging";
  minColor: string;
  maxColor: string;
  midColor: string;
}) {
  const stops = useMemo(() => {
    const count = 20;
    const colours: string[] = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      colours.push(interpolateColor(t, colorScale, minColor, maxColor, midColor));
    }
    return colours;
  }, [colorScale, minColor, maxColor, midColor]);

  const gradient = `linear-gradient(to right, ${stops.join(", ")})`;

  return (
    <div className="flex items-center gap-2 mt-4 px-1">
      <span className="text-xs text-muted-foreground tabular-nums">
        {minVal.toLocaleString()}
      </span>
      <div
        className="flex-1 h-3 rounded-sm"
        style={{ background: gradient }}
      />
      <span className="text-xs text-muted-foreground tabular-nums">
        {maxVal.toLocaleString()}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Renderer                                                          */
/* ------------------------------------------------------------------ */

export function HeatmapRenderer({ data }: HeatmapRendererProps) {
  const {
    title,
    rows,
    columns,
    values,
    colorScale = "sequential",
    minColor = colorScale === "diverging" ? "#3b82f6" : "#ffffff",
    maxColor = colorScale === "diverging" ? "#ef4444" : "#1e40af",
    midColor = "#ffffff",
    showValues = false,
    annotations,
  } = data;

  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  /* Flatten values to compute min/max for normalisation */
  const { minVal, maxVal } = useMemo(() => {
    const flat = values.flat();
    return {
      minVal: Math.min(...flat),
      maxVal: Math.max(...flat),
    };
  }, [values]);

  const normalize = (v: number) =>
    maxVal === minVal ? 0.5 : (v - minVal) / (maxVal - minVal);

  /* Grid template: row-header column + data columns */
  const gridTemplateColumns = `auto repeat(${columns.length}, 1fr)`;

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[900px] mx-auto p-6"
      >
        <Card>
          <CardContent className="p-6">
            {/* Header */}
            {title && (
              <h2 className="text-lg font-semibold mb-4">{title}</h2>
            )}

            {/* Scrollable grid */}
            <ScrollArea className="w-full">
              <TooltipProvider delayDuration={150}>
                <div
                  className="grid gap-px"
                  style={{ gridTemplateColumns }}
                  role="grid"
                  aria-label={title ?? "Heatmap"}
                >
                  {/* Column headers row */}
                  <div className="sticky left-0 z-10" role="columnheader" />
                  {columns.map((col) => (
                    <div
                      key={col}
                      className="text-xs font-medium text-muted-foreground text-center py-1.5 px-1 whitespace-nowrap"
                      role="columnheader"
                    >
                      {col}
                    </div>
                  ))}

                  {/* Data rows */}
                  {values.map((row, ri) => (
                    <>
                      {/* Row header */}
                      <div
                        key={`rh-${ri}`}
                        className="sticky left-0 z-10 bg-background text-xs font-medium text-muted-foreground flex items-center pr-2 whitespace-nowrap"
                        role="rowheader"
                      >
                        {rows[ri]}
                      </div>

                      {/* Cells */}
                      {row.map((value, ci) => {
                        const t = normalize(value);
                        const bg = interpolateColor(
                          t,
                          colorScale,
                          minColor,
                          maxColor,
                          midColor,
                        );
                        const textColor = getTextColorForBg(bg);
                        const annotation = findAnnotation(annotations, ri, ci);
                        const isHovered =
                          hoveredCell?.row === ri && hoveredCell?.col === ci;

                        return (
                          <Tooltip key={`${ri}-${ci}`}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "relative flex items-center justify-center min-h-[32px] min-w-[40px] rounded-sm transition-all cursor-default",
                                  isHovered && "ring-2 ring-foreground/30",
                                )}
                                style={{
                                  backgroundColor: bg,
                                  color: textColor,
                                }}
                                role="gridcell"
                                aria-label={`${rows[ri]}, ${columns[ci]}: ${value}`}
                                onMouseEnter={() =>
                                  setHoveredCell({ row: ri, col: ci })
                                }
                                onMouseLeave={() => setHoveredCell(null)}
                              >
                                {showValues && (
                                  <span className="text-xs tabular-nums font-medium">
                                    {value.toLocaleString()}
                                  </span>
                                )}
                                {annotation && (
                                  <span
                                    className="absolute bottom-0.5 right-0.5 text-[9px] leading-none font-semibold opacity-80"
                                    style={{ color: textColor }}
                                  >
                                    {annotation.label}
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-semibold">
                                  {rows[ri]} / {columns[ci]}
                                </div>
                                <div className="tabular-nums">
                                  {value.toLocaleString()}
                                </div>
                                {annotation && (
                                  <div className="text-muted-foreground mt-0.5">
                                    {annotation.label}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </>
                  ))}
                </div>
              </TooltipProvider>
            </ScrollArea>

            {/* Colour legend */}
            <ColorLegend
              minVal={minVal}
              maxVal={maxVal}
              colorScale={colorScale}
              minColor={minColor}
              maxColor={maxColor}
              midColor={midColor}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
