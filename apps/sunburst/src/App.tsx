import { useState, useMemo, useCallback } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { SunburstContent, SunburstNode } from "./schema";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SVG_SIZE = 400;
const CENTER = SVG_SIZE / 2;
const MIN_RADIUS = 40;
const RING_WIDTH = 50;
const LABEL_ARC_THRESHOLD = 0.15; // radians — arcs wider than this get a label
const TWO_PI = 2 * Math.PI;

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                                */
/* ------------------------------------------------------------------ */

export function SunburstView() {
  const { data, content, isConnected } =
    useView<SunburstContent>("sunburst", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <SunburstRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                       */
/* ------------------------------------------------------------------ */

export interface SunburstRendererProps {
  data: SunburstContent;
}

export function SunburstRenderer({ data }: SunburstRendererProps) {
  const { title, root, showLabels = false, interactive = true } = data;

  const [focusNode, setFocusNode] = useState<SunburstNode | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<SunburstNode[]>([]);

  const displayRoot = focusNode ?? root;

  /* ---- compute total value recursively ---- */
  const computeValue = useCallback((node: SunburstNode): number => {
    if (!node.children || node.children.length === 0) {
      return node.value ?? 1;
    }
    return node.children.reduce((sum, c) => sum + computeValue(c), 0);
  }, []);

  /* ---- build flat arc list for SVG ---- */
  interface ArcDatum {
    node: SunburstNode;
    depth: number;
    startAngle: number;
    endAngle: number;
    color: string;
  }

  const arcs = useMemo(() => {
    const result: ArcDatum[] = [];
    let colorIndex = 0;

    function walk(
      node: SunburstNode,
      depth: number,
      startAngle: number,
      endAngle: number,
      parentColor?: string,
    ) {
      const color =
        node.color ??
        parentColor ??
        hslColor(colorIndex++, depth);

      if (depth > 0) {
        result.push({ node, depth, startAngle, endAngle, color });
      }

      if (node.children && node.children.length > 0) {
        const totalValue = node.children.reduce(
          (sum, c) => sum + computeValue(c),
          0,
        );
        if (totalValue === 0) return;

        let angle = startAngle;
        for (const child of node.children) {
          const childValue = computeValue(child);
          const childAngle = (childValue / totalValue) * (endAngle - startAngle);
          walk(child, depth + 1, angle, angle + childAngle, color);
          angle += childAngle;
        }
      }
    }

    walk(displayRoot, 0, 0, TWO_PI);
    return result;
  }, [displayRoot, computeValue]);

  /* ---- interaction handlers ---- */
  const handleArcClick = useCallback(
    (node: SunburstNode) => {
      if (!interactive) return;
      if (node.children && node.children.length > 0) {
        setBreadcrumbs((prev) => [...prev, displayRoot]);
        setFocusNode(node);
        setHoveredId(null);
      }
    },
    [interactive, displayRoot],
  );

  const handleCenterClick = useCallback(() => {
    if (!interactive) return;
    setBreadcrumbs((prev) => {
      const next = [...prev];
      const parent = next.pop() ?? null;
      setFocusNode(parent);
      setHoveredId(null);
      return next;
    });
  }, [interactive]);

  /* ---- hovered node info for center label ---- */
  const hoveredArc = useMemo(
    () => arcs.find((a) => a.node.id === hoveredId),
    [arcs, hoveredId],
  );

  const centerLabel = hoveredArc
    ? hoveredArc.node.label
    : displayRoot.label;

  const centerValue = hoveredArc
    ? formatNumber(computeValue(hoveredArc.node))
    : formatNumber(computeValue(displayRoot));

  return (
    <div className="h-full flex items-center justify-center font-sans text-foreground bg-background p-4">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className={cn("w-full max-w-[480px]")}
      >
        <Card>
          <CardContent className="p-6">
            {title && (
              <div className="text-sm font-medium text-muted-foreground mb-3 text-center">
                {title}
              </div>
            )}

            <svg
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              className="w-full"
              role="img"
              aria-label={title ?? "Sunburst chart"}
            >
              {/* Arcs */}
              {arcs.map((arc) => {
                const innerR = MIN_RADIUS + (arc.depth - 1) * RING_WIDTH;
                const outerR = MIN_RADIUS + arc.depth * RING_WIDTH;
                const d = describeArc(
                  CENTER,
                  CENTER,
                  innerR,
                  outerR,
                  arc.startAngle,
                  arc.endAngle,
                );

                const isHovered = hoveredId === arc.node.id;
                const hasHover = hoveredId !== null;

                return (
                  <path
                    key={arc.node.id}
                    d={d}
                    fill={arc.color}
                    stroke="var(--color-background, #fff)"
                    strokeWidth="1.5"
                    opacity={hasHover ? (isHovered ? 1 : 0.5) : 0.85}
                    style={{
                      cursor: interactive && arc.node.children?.length ? "pointer" : "default",
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseEnter={() => setHoveredId(arc.node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleArcClick(arc.node)}
                  />
                );
              })}

              {/* Arc labels */}
              {showLabels &&
                arcs
                  .filter((arc) => arc.endAngle - arc.startAngle > LABEL_ARC_THRESHOLD)
                  .map((arc) => {
                    const midAngle = (arc.startAngle + arc.endAngle) / 2;
                    const midR =
                      MIN_RADIUS + (arc.depth - 0.5) * RING_WIDTH;
                    const x = CENTER + midR * Math.cos(midAngle - Math.PI / 2);
                    const y = CENTER + midR * Math.sin(midAngle - Math.PI / 2);

                    // Rotate text to follow the radial direction
                    let rotation = ((midAngle * 180) / Math.PI) - 90;
                    // Flip text that would be upside down
                    if (rotation > 90 && rotation < 270) {
                      rotation += 180;
                    }

                    return (
                      <text
                        key={`label-${arc.node.id}`}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-foreground pointer-events-none"
                        fontSize="9"
                        fontWeight="500"
                        transform={`rotate(${rotation}, ${x}, ${y})`}
                      >
                        {truncateLabel(arc.node.label, arc.endAngle - arc.startAngle)}
                      </text>
                    );
                  })}

              {/* Center circle (click to go back up) */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={MIN_RADIUS - 4}
                className="fill-background"
                stroke="var(--color-border, #e0e0e0)"
                strokeWidth="1"
                style={{
                  cursor: interactive && breadcrumbs.length > 0 ? "pointer" : "default",
                }}
                onClick={handleCenterClick}
              />

              {/* Center label */}
              <text
                x={CENTER}
                y={CENTER - 6}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground pointer-events-none"
                fontSize="11"
                fontWeight="600"
              >
                {truncateLabel(centerLabel, 1.5)}
              </text>
              <text
                x={CENTER}
                y={CENTER + 10}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground pointer-events-none"
                fontSize="10"
              >
                {centerValue}
              </text>
            </svg>

            {/* Breadcrumb trail */}
            {interactive && breadcrumbs.length > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground justify-center flex-wrap">
                <button
                  className="hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit text-xs text-muted-foreground"
                  onClick={() => {
                    setFocusNode(null);
                    setBreadcrumbs([]);
                    setHoveredId(null);
                  }}
                >
                  {root.label}
                </button>
                {breadcrumbs.slice(1).map((bc, i) => (
                  <span key={bc.id} className="flex items-center gap-1">
                    <span>/</span>
                    <button
                      className="hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit text-xs text-muted-foreground"
                      onClick={() => {
                        const idx = i + 1; // +1 because we sliced off root
                        setFocusNode(breadcrumbs[idx]);
                        setBreadcrumbs((prev) => prev.slice(0, idx));
                        setHoveredId(null);
                      }}
                    >
                      {bc.label}
                    </button>
                  </span>
                ))}
                <span>/</span>
                <span className="font-medium text-foreground">
                  {displayRoot.label}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG Arc Helper                                                     */
/* ------------------------------------------------------------------ */

/**
 * Produces an SVG path `d` string for an arc sector (annular wedge).
 * Angles are in radians, starting from 12 o'clock (top), going clockwise.
 */
function describeArc(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
): string {
  // Clamp arc to just under 2PI to avoid a degenerate full-circle path
  const arcSpan = Math.min(endAngle - startAngle, TWO_PI - 0.0001);
  const end = startAngle + arcSpan;

  const largeArc = arcSpan > Math.PI ? 1 : 0;

  // Convert angle to SVG coordinates (0 = top, clockwise)
  const toX = (r: number, angle: number) => cx + r * Math.sin(angle);
  const toY = (r: number, angle: number) => cy - r * Math.cos(angle);

  const outerStart = { x: toX(outerR, startAngle), y: toY(outerR, startAngle) };
  const outerEnd = { x: toX(outerR, end), y: toY(outerR, end) };
  const innerStart = { x: toX(innerR, end), y: toY(innerR, end) };
  const innerEnd = { x: toX(innerR, startAngle), y: toY(innerR, startAngle) };

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

/* ------------------------------------------------------------------ */
/*  Color Helper                                                       */
/* ------------------------------------------------------------------ */

function hslColor(index: number, depth: number): string {
  const hue = (index * 47 + depth * 30) % 360;
  const saturation = 65 + (depth * 5);
  const lightness = 55 - (depth * 5);
  return `hsl(${hue}, ${Math.min(saturation, 80)}%, ${Math.max(lightness, 35)}%)`;
}

/* ------------------------------------------------------------------ */
/*  Formatting Helpers                                                 */
/* ------------------------------------------------------------------ */

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(value);
}

function truncateLabel(label: string, arcSpan: number): string {
  // Wider arcs can fit more characters
  const maxChars = Math.max(3, Math.floor(arcSpan * 8));
  if (label.length <= maxChars) return label;
  return label.slice(0, maxChars - 1) + "\u2026";
}
