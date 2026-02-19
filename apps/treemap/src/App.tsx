import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent, Button, Badge, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { TreemapContent, TreemapNode } from "./schema";

/* ------------------------------------------------------------------ */
/*  Default colour palette                                            */
/* ------------------------------------------------------------------ */

const PALETTE = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
  "#a855f7", "#84cc16", "#e11d48", "#0ea5e9", "#d946ef",
  "#10b981",
];

/* ------------------------------------------------------------------ */
/*  Colour helpers                                                    */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function luminance(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function contrastTextColor(bgHex: string): string {
  const [r, g, b] = hexToRgb(bgHex);
  return luminance(r, g, b) < 128 ? "#ffffff" : "#1e293b";
}

function nodeColor(node: TreemapNode, index: number): string {
  if (node.color) return node.color;
  return PALETTE[index % PALETTE.length];
}

/* ------------------------------------------------------------------ */
/*  Squarified treemap layout algorithm                               */
/* ------------------------------------------------------------------ */

interface LayoutRect {
  node: TreemapNode;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  depth: number;
}

/**
 * Compute the total value of a node. If the node has children, the value
 * is the sum of all descendant leaf values. If it is a leaf, use
 * node.value (defaulting to 1).
 */
function computeValue(node: TreemapNode): number {
  if (node.children && node.children.length > 0) {
    return node.children.reduce((sum, c) => sum + computeValue(c), 0);
  }
  return node.value ?? 1;
}

/**
 * Squarified layout: attempt to place children in rows that minimise
 * the worst aspect ratio. This is a simplified version of the
 * Bruls/Huizing/van Wijk algorithm.
 */
function squarify(
  children: { node: TreemapNode; area: number; color: string }[],
  x: number,
  y: number,
  w: number,
  h: number,
  depth: number,
): LayoutRect[] {
  if (children.length === 0) return [];

  const totalArea = children.reduce((s, c) => s + c.area, 0);
  if (totalArea <= 0) return [];

  // Scale areas to fit available rectangle
  const scale = (w * h) / totalArea;
  const scaled = children.map((c) => ({
    ...c,
    scaledArea: c.area * scale,
  }));

  const rects: LayoutRect[] = [];

  function layoutRow(
    row: typeof scaled,
    rx: number,
    ry: number,
    rw: number,
    rh: number,
  ) {
    const rowArea = row.reduce((s, c) => s + c.scaledArea, 0);

    if (rw >= rh) {
      // Lay out vertically along left edge
      const rowWidth = rowArea / rh;
      let cy = ry;
      for (const item of row) {
        const itemHeight = item.scaledArea / rowWidth;
        rects.push({
          node: item.node,
          x: rx,
          y: cy,
          w: rowWidth,
          h: itemHeight,
          color: item.color,
          depth,
        });
        cy += itemHeight;
      }
      return { rx: rx + rowWidth, ry, rw: rw - rowWidth, rh };
    } else {
      // Lay out horizontally along top edge
      const rowHeight = rowArea / rw;
      let cx = rx;
      for (const item of row) {
        const itemWidth = item.scaledArea / rowHeight;
        rects.push({
          node: item.node,
          x: cx,
          y: ry,
          w: itemWidth,
          h: rowHeight,
          color: item.color,
          depth,
        });
        cx += itemWidth;
      }
      return { rx, ry: ry + rowHeight, rw, rh: rh - rowHeight };
    }
  }

  function worstRatio(
    row: typeof scaled,
    side: number,
  ): number {
    const rowArea = row.reduce((s, c) => s + c.scaledArea, 0);
    const maxArea = Math.max(...row.map((c) => c.scaledArea));
    const minArea = Math.min(...row.map((c) => c.scaledArea));
    const s2 = side * side;
    const rA2 = rowArea * rowArea;
    if (rA2 === 0 || minArea === 0) return Infinity;
    return Math.max(
      (s2 * maxArea) / rA2,
      rA2 / (s2 * minArea),
    );
  }

  let remaining = [...scaled];
  let cx = x;
  let cy = y;
  let cw = w;
  let ch = h;

  while (remaining.length > 0) {
    const side = Math.min(cw, ch);
    if (side <= 0) break;

    let row = [remaining[0]];
    let bestRatio = worstRatio(row, side);

    let i = 1;
    while (i < remaining.length) {
      const candidate = [...row, remaining[i]];
      const ratio = worstRatio(candidate, side);
      if (ratio <= bestRatio) {
        row = candidate;
        bestRatio = ratio;
        i++;
      } else {
        break;
      }
    }

    const result = layoutRow(row, cx, cy, cw, ch);
    cx = result.rx;
    cy = result.ry;
    cw = result.rw;
    ch = result.rh;

    remaining = remaining.slice(row.length);
  }

  return rects;
}

/**
 * Build the full layout for a root node. Only lays out the immediate
 * children; drill-down handles deeper levels.
 */
function buildLayout(
  root: TreemapNode,
  width: number,
  height: number,
): LayoutRect[] {
  const children = root.children ?? [];
  if (children.length === 0) {
    // Single node fills the entire area
    return [
      {
        node: root,
        x: 0,
        y: 0,
        w: width,
        h: height,
        color: nodeColor(root, 0),
        depth: 0,
      },
    ];
  }

  const items = children.map((child, i) => ({
    node: child,
    area: computeValue(child),
    color: nodeColor(child, i),
  }));

  return squarify(items, 0, 0, width, height, 0);
}

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                               */
/* ------------------------------------------------------------------ */

export function TreemapView() {
  const { data, content, isConnected } =
    useView<TreemapContent>("treemap", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <TreemapRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                    */
/* ------------------------------------------------------------------ */

export interface TreemapRendererProps {
  data: TreemapContent;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                      */
/* ------------------------------------------------------------------ */

export function TreemapRenderer({ data }: TreemapRendererProps) {
  const {
    title,
    root,
    showLabels = true,
    interactive = true,
  } = data;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [drillPath, setDrillPath] = useState<TreemapNode[]>([root]);
  const [hoveredRect, setHoveredRect] = useState<LayoutRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Current root is the last node in the drill path
  const currentRoot = drillPath[drillPath.length - 1];

  // Compute layout
  const layout = useMemo(
    () => buildLayout(currentRoot, size.width, size.height),
    [currentRoot, size.width, size.height],
  );

  // Reset drill path when root data changes
  useEffect(() => {
    setDrillPath([root]);
  }, [root]);

  // ResizeObserver to track container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Draw the treemap on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size.width, size.height);

    for (const rect of layout) {
      // Fill
      ctx.fillStyle = rect.color;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

      // Border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

      // Hover highlight
      if (
        hoveredRect &&
        hoveredRect.node.id === rect.node.id
      ) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
      }

      // Labels
      if (showLabels && rect.w > 30 && rect.h > 18) {
        const textColor = contrastTextColor(rect.color);
        ctx.fillStyle = textColor;

        // Label
        const maxTextWidth = rect.w - 8;
        const fontSize = Math.min(14, Math.max(9, rect.h / 4));
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textBaseline = "top";

        let label = rect.node.label;
        // Truncate label if it's too wide
        while (ctx.measureText(label).width > maxTextWidth && label.length > 1) {
          label = label.slice(0, -1);
        }
        if (label !== rect.node.label && label.length > 0) {
          label = label.slice(0, -1) + "\u2026";
        }

        ctx.fillText(label, rect.x + 4, rect.y + 4);

        // Value below the label if there's room
        const value = computeValue(rect.node);
        if (rect.h > 36) {
          const valueFontSize = Math.min(11, Math.max(8, rect.h / 6));
          ctx.font = `400 ${valueFontSize}px system-ui, -apple-system, sans-serif`;
          ctx.globalAlpha = 0.8;
          ctx.fillText(
            value.toLocaleString(),
            rect.x + 4,
            rect.y + fontSize + 6,
          );
          ctx.globalAlpha = 1.0;
        }
      }
    }
  }, [layout, size, showLabels, hoveredRect]);

  // Find rect under cursor
  const findRectAtPoint = useCallback(
    (clientX: number, clientY: number): LayoutRect | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const bounds = canvas.getBoundingClientRect();
      const mx = clientX - bounds.left;
      const my = clientY - bounds.top;

      // Search in reverse order so top-drawn rects get priority
      for (let i = layout.length - 1; i >= 0; i--) {
        const r = layout[i];
        if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
          return r;
        }
      }
      return null;
    },
    [layout],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = findRectAtPoint(e.clientX, e.clientY);
      setHoveredRect(rect);
      if (rect) {
        const canvas = canvasRef.current;
        if (canvas) {
          const bounds = canvas.getBoundingClientRect();
          setTooltipPos({
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
          });
        }
      }
    },
    [findRectAtPoint],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredRect(null);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!interactive) return;
      const rect = findRectAtPoint(e.clientX, e.clientY);
      if (rect && rect.node.children && rect.node.children.length > 0) {
        setDrillPath((prev) => [...prev, rect.node]);
      }
    },
    [interactive, findRectAtPoint],
  );

  const navigateTo = useCallback((index: number) => {
    setDrillPath((prev) => prev.slice(0, index + 1));
  }, []);

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="h-full flex flex-col p-4"
      >
        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="flex-1 flex flex-col min-h-0 p-4">
            {/* Header */}
            {title && (
              <h2 className="text-lg font-semibold mb-3 flex-shrink-0">
                {title}
              </h2>
            )}

            {/* Breadcrumbs */}
            {drillPath.length > 1 && (
              <div className="flex items-center gap-1 mb-3 flex-shrink-0 flex-wrap">
                {drillPath.map((node, i) => (
                  <span key={node.id} className="flex items-center gap-1">
                    {i > 0 && (
                      <span className="text-xs text-muted-foreground">/</span>
                    )}
                    {i < drillPath.length - 1 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => navigateTo(i)}
                      >
                        {node.label}
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {node.label}
                      </Badge>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Canvas container */}
            <div
              ref={containerRef}
              className="flex-1 min-h-0 relative"
            >
              <canvas
                ref={canvasRef}
                className={cn(
                  "block",
                  interactive && "cursor-pointer",
                )}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
              />

              {/* Tooltip */}
              {hoveredRect && (
                <div
                  className="absolute pointer-events-none z-10 bg-popover text-popover-foreground border rounded-md shadow-md px-3 py-2 text-xs"
                  style={{
                    left: Math.min(
                      tooltipPos.x + 12,
                      size.width - 160,
                    ),
                    top: Math.min(
                      tooltipPos.y + 12,
                      size.height - 80,
                    ),
                  }}
                >
                  <div className="font-semibold mb-0.5">
                    {hoveredRect.node.label}
                  </div>
                  <div className="tabular-nums text-muted-foreground">
                    Value: {computeValue(hoveredRect.node).toLocaleString()}
                  </div>
                  {hoveredRect.node.children && (
                    <div className="text-muted-foreground">
                      Children: {hoveredRect.node.children.length}
                    </div>
                  )}
                  {hoveredRect.node.metadata &&
                    Object.entries(hoveredRect.node.metadata).map(
                      ([key, val]) => (
                        <div
                          key={key}
                          className="text-muted-foreground"
                        >
                          {key}: {val}
                        </div>
                      ),
                    )}
                  {interactive &&
                    hoveredRect.node.children &&
                    hoveredRect.node.children.length > 0 && (
                      <div className="mt-1 text-[10px] text-muted-foreground/70">
                        Click to drill down
                      </div>
                    )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
