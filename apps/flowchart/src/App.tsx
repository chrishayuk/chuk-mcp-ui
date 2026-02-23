import { useMemo } from "react";
import { useView } from "@chuk/view-shared";
import { Card, CardContent } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type {
  FlowchartContent,
  FlowchartNode,
  FlowchartEdge,
} from "./schema";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const NODE_W = 140;
const NODE_H = 50;
const DIAMOND_SIZE = 70;
const LAYER_GAP_TB = 100;
const LAYER_GAP_LR = 180;
const NODE_GAP = 40;

const DEFAULT_SHAPE_COLORS: Record<string, string> = {
  rect: "#3b82f6",
  diamond: "#f59e0b",
  ellipse: "#22c55e",
  parallelogram: "#8b5cf6",
};

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                                */
/* ------------------------------------------------------------------ */

export function FlowchartView() {
  const { data } =
    useView<FlowchartContent>("flowchart", "1.0");

  if (!data) return null;

  return <FlowchartRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Layout engine — simple Sugiyama-like layered assignment             */
/* ------------------------------------------------------------------ */

interface LayoutNode {
  id: string;
  label: string;
  shape: "rect" | "diamond" | "ellipse" | "parallelogram";
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface LayoutEdge {
  source: string;
  target: string;
  label?: string;
  style: "solid" | "dashed";
}

function computeLayout(
  nodes: FlowchartNode[],
  edges: FlowchartEdge[],
  direction: "TB" | "LR"
): { layoutNodes: LayoutNode[]; layoutEdges: LayoutEdge[] } {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Build adjacency (parent pointers for layer assignment)
  const parents = new Map<string, string[]>();
  for (const n of nodes) {
    parents.set(n.id, []);
  }
  for (const e of edges) {
    if (nodeMap.has(e.source) && nodeMap.has(e.target)) {
      parents.get(e.target)!.push(e.source);
    }
  }

  // Assign layers using longest path from roots
  const layers = new Map<string, number>();
  const visited = new Set<string>();

  function assignLayer(id: string): number {
    if (layers.has(id)) return layers.get(id)!;
    if (visited.has(id)) return 0; // cycle guard
    visited.add(id);

    const pars = parents.get(id) ?? [];
    if (pars.length === 0) {
      layers.set(id, 0);
      return 0;
    }
    const maxParent = Math.max(...pars.map((p) => assignLayer(p)));
    const layer = maxParent + 1;
    layers.set(id, layer);
    return layer;
  }

  for (const n of nodes) {
    assignLayer(n.id);
  }

  // Group by layer
  const layerGroups = new Map<number, string[]>();
  for (const n of nodes) {
    const layer = layers.get(n.id) ?? 0;
    if (!layerGroups.has(layer)) layerGroups.set(layer, []);
    layerGroups.get(layer)!.push(n.id);
  }

  const maxLayer = Math.max(0, ...layerGroups.keys());
  const isLR = direction === "LR";
  const layerGap = isLR ? LAYER_GAP_LR : LAYER_GAP_TB;

  // Position nodes
  const layoutNodes: LayoutNode[] = [];

  for (let layer = 0; layer <= maxLayer; layer++) {
    const ids = layerGroups.get(layer) ?? [];
    const count = ids.length;

    ids.forEach((id, idx) => {
      const n = nodeMap.get(id)!;
      const shape = n.shape ?? "rect";
      const color = n.color ?? DEFAULT_SHAPE_COLORS[shape] ?? "#3b82f6";
      const w = shape === "diamond" ? DIAMOND_SIZE * 2 : NODE_W;
      const h = shape === "diamond" ? DIAMOND_SIZE * 2 : NODE_H;

      const offset = (idx - (count - 1) / 2) * (Math.max(NODE_W, DIAMOND_SIZE * 2) + NODE_GAP);

      const x = isLR ? layer * layerGap : offset;
      const y = isLR ? offset : layer * layerGap;

      layoutNodes.push({ id, label: n.label, shape, color, x, y, w, h });
    });
  }

  // Center the whole layout
  if (layoutNodes.length > 0) {
    const minX = Math.min(...layoutNodes.map((n) => n.x - n.w / 2));
    const minY = Math.min(...layoutNodes.map((n) => n.y - n.h / 2));
    for (const ln of layoutNodes) {
      ln.x -= minX - 60;
      ln.y -= minY - 60;
    }
  }

  const layoutEdges: LayoutEdge[] = edges
    .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
    .map((e) => ({
      source: e.source,
      target: e.target,
      label: e.label,
      style: e.style ?? "solid",
    }));

  return { layoutNodes, layoutEdges };
}

/* ------------------------------------------------------------------ */
/*  SVG Node shapes                                                    */
/* ------------------------------------------------------------------ */

function NodeShape({ node }: { node: LayoutNode }) {
  const { x, y, w, h, shape, color, label } = node;

  const textEl = (
    <text
      x={x}
      y={y + 1}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="12"
      fontFamily="sans-serif"
      fill="#fff"
      style={{ pointerEvents: "none" }}
    >
      {label.length > 18 ? label.slice(0, 16) + "..." : label}
    </text>
  );

  switch (shape) {
    case "diamond": {
      const half = DIAMOND_SIZE;
      const points = `${x},${y - half} ${x + half},${y} ${x},${y + half} ${x - half},${y}`;
      return (
        <g>
          <polygon points={points} fill={color} stroke={color} strokeWidth="2" opacity="0.85" />
          {textEl}
        </g>
      );
    }
    case "ellipse":
      return (
        <g>
          <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} fill={color} stroke={color} strokeWidth="2" opacity="0.85" />
          {textEl}
        </g>
      );
    case "parallelogram": {
      const skew = 15;
      const points = `${x - w / 2 + skew},${y - h / 2} ${x + w / 2 + skew},${y - h / 2} ${x + w / 2 - skew},${y + h / 2} ${x - w / 2 - skew},${y + h / 2}`;
      return (
        <g>
          <polygon points={points} fill={color} stroke={color} strokeWidth="2" opacity="0.85" />
          {textEl}
        </g>
      );
    }
    default: // rect
      return (
        <g>
          <rect
            x={x - w / 2}
            y={y - h / 2}
            width={w}
            height={h}
            rx="8"
            ry="8"
            fill={color}
            stroke={color}
            strokeWidth="2"
            opacity="0.85"
          />
          {textEl}
        </g>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  SVG edge with arrowhead                                            */
/* ------------------------------------------------------------------ */

function EdgePath({
  edge,
  nodeMap,
}: {
  edge: LayoutEdge;
  nodeMap: Map<string, LayoutNode>;
}) {
  const src = nodeMap.get(edge.source);
  const tgt = nodeMap.get(edge.target);
  if (!src || !tgt) return null;

  // Find edge connection points on node boundaries
  const dx = tgt.x - src.x;
  const dy = tgt.y - src.y;
  const angle = Math.atan2(dy, dx);

  const srcX = src.x + Math.cos(angle) * (src.w / 2);
  const srcY = src.y + Math.sin(angle) * (src.h / 2);
  const tgtX = tgt.x - Math.cos(angle) * (tgt.w / 2);
  const tgtY = tgt.y - Math.sin(angle) * (tgt.h / 2);

  const midX = (srcX + tgtX) / 2;
  const midY = (srcY + tgtY) / 2;

  const markerId = `arrow-${edge.source}-${edge.target}`;

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 6"
          refX="10"
          refY="3"
          markerWidth="10"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 3 L 0 6 z" className="fill-foreground" opacity="0.6" />
        </marker>
      </defs>
      <line
        x1={srcX}
        y1={srcY}
        x2={tgtX}
        y2={tgtY}
        className="stroke-foreground"
        strokeWidth="1.5"
        opacity="0.5"
        strokeDasharray={edge.style === "dashed" ? "6 4" : undefined}
        markerEnd={`url(#${markerId})`}
      />
      {edge.label && (
        <text
          x={midX}
          y={midY - 8}
          textAnchor="middle"
          fontSize="10"
          fontFamily="sans-serif"
          className="fill-muted-foreground"
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                       */
/* ------------------------------------------------------------------ */

export interface FlowchartRendererProps {
  data: FlowchartContent;
}

export function FlowchartRenderer({ data }: FlowchartRendererProps) {
  const direction = data.direction ?? "TB";

  const { layoutNodes, layoutEdges } = useMemo(
    () => computeLayout(data.nodes, data.edges, direction),
    [data.nodes, data.edges, direction]
  );

  const nodeMap = useMemo(
    () => new Map(layoutNodes.map((n) => [n.id, n])),
    [layoutNodes]
  );

  // Compute viewBox
  const svgBounds = useMemo(() => {
    if (layoutNodes.length === 0) return { x: 0, y: 0, w: 400, h: 300 };
    const maxX = Math.max(...layoutNodes.map((n) => n.x + n.w / 2));
    const maxY = Math.max(...layoutNodes.map((n) => n.y + n.h / 2));
    return { x: 0, y: 0, w: maxX + 60, h: maxY + 60 };
  }, [layoutNodes]);

  return (
    <div className="h-full flex flex-col font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="h-full flex flex-col"
      >
        <Card className="m-4 flex-1 flex flex-col overflow-hidden">
          {data.title && (
            <div className="px-4 py-3 border-b">
              <h2 className="text-base font-semibold m-0">{data.title}</h2>
            </div>
          )}
          <CardContent className="flex-1 p-4 flex items-center justify-center overflow-auto">
            <svg
              viewBox={`${svgBounds.x} ${svgBounds.y} ${svgBounds.w} ${svgBounds.h}`}
              className="w-full h-full"
              style={{ maxHeight: "100%" }}
            >
              {/* Edges first (behind nodes) */}
              {layoutEdges.map((e) => (
                <EdgePath
                  key={`${e.source}-${e.target}`}
                  edge={e}
                  nodeMap={nodeMap}
                />
              ))}
              {/* Nodes on top */}
              {layoutNodes.map((n) => (
                <NodeShape key={n.id} node={n} />
              ))}
            </svg>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
