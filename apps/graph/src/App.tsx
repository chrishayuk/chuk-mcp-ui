import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent, CardHeader, CardTitle } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { GraphContent, GraphNode, GraphEdge } from "./schema";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GROUP_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

const DEFAULT_NODE_RADIUS = 20;
const REPULSION_STRENGTH = 3000;
const SPRING_STRENGTH = 0.005;
const CENTER_GRAVITY = 0.01;
const DAMPING = 0.9;
const SIMULATION_ITERATIONS = 120;

/* ------------------------------------------------------------------ */
/*  Force simulation types                                             */
/* ------------------------------------------------------------------ */

interface SimNode {
  id: string;
  label: string;
  color: string;
  radius: number;
  group: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/* ------------------------------------------------------------------ */
/*  Force simulation                                                   */
/* ------------------------------------------------------------------ */

function runSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
): SimNode[] {
  // Assign group colors
  const groupSet = new Set<string>();
  for (const n of nodes) {
    if (n.group) groupSet.add(n.group);
  }
  const groupArray = Array.from(groupSet);
  const groupColorMap = new Map<string, string>();
  for (let i = 0; i < groupArray.length; i++) {
    groupColorMap.set(groupArray[i], GROUP_COLORS[i % GROUP_COLORS.length]);
  }

  const cx = width / 2;
  const cy = height / 2;

  // Initialize nodes in a circle
  const simNodes: SimNode[] = nodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    const spread = Math.min(width, height) * 0.3;
    return {
      id: n.id,
      label: n.label,
      color: n.color ?? (n.group ? groupColorMap.get(n.group) ?? GROUP_COLORS[i % GROUP_COLORS.length] : GROUP_COLORS[i % GROUP_COLORS.length]),
      radius: n.size ?? DEFAULT_NODE_RADIUS,
      group: n.group ?? "",
      x: cx + Math.cos(angle) * spread,
      y: cy + Math.sin(angle) * spread,
      vx: 0,
      vy: 0,
    };
  });

  const nodeIndex = new Map<string, number>();
  for (let i = 0; i < simNodes.length; i++) {
    nodeIndex.set(simNodes[i].id, i);
  }

  // Run simulation iterations
  for (let iter = 0; iter < SIMULATION_ITERATIONS; iter++) {
    const alpha = 1 - iter / SIMULATION_ITERATIONS;

    // Repulsion (Coulomb's law) between all node pairs
    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const a = simNodes[i];
        const b = simNodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) dist = 1;

        const force = (REPULSION_STRENGTH * alpha) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Attraction along edges (spring force)
    for (const edge of edges) {
      const si = nodeIndex.get(edge.source);
      const ti = nodeIndex.get(edge.target);
      if (si === undefined || ti === undefined) continue;

      const a = simNodes[si];
      const b = simNodes[ti];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) continue;

      const w = edge.weight ?? 1;
      const force = SPRING_STRENGTH * dist * w * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Center gravity
    for (const node of simNodes) {
      node.vx += (cx - node.x) * CENTER_GRAVITY * alpha;
      node.vy += (cy - node.y) * CENTER_GRAVITY * alpha;
    }

    // Apply velocities with damping
    for (const node of simNodes) {
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x += node.vx;
      node.y += node.vy;

      // Keep within bounds with padding
      const pad = node.radius + 10;
      node.x = Math.max(pad, Math.min(width - pad, node.x));
      node.y = Math.max(pad, Math.min(height - pad, node.y));
    }
  }

  return simNodes;
}

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                                */
/* ------------------------------------------------------------------ */

export function GraphView() {
  const { data, content, isConnected } =
    useView<GraphContent>("graph", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <GraphRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                       */
/* ------------------------------------------------------------------ */

export function GraphRenderer({ data }: { data: GraphContent }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width || 800,
          height: entry.contentRect.height || 600,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Run force simulation
  const simNodes = useMemo(
    () => runSimulation(data.nodes, data.edges, dimensions.width, dimensions.height),
    [data.nodes, data.edges, dimensions.width, dimensions.height],
  );

  // Build node position lookup
  const nodePositions = useMemo(() => {
    const map = new Map<string, SimNode>();
    for (const n of simNodes) {
      map.set(n.id, n);
    }
    return map;
  }, [simNodes]);

  // Connected nodes for hover highlight
  const connectedIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const ids = new Set<string>([hoveredNodeId]);
    for (const edge of data.edges) {
      if (edge.source === hoveredNodeId) ids.add(edge.target);
      if (edge.target === hoveredNodeId) ids.add(edge.source);
    }
    return ids;
  }, [hoveredNodeId, data.edges]);

  const handleNodeHover = useCallback((id: string | null) => {
    setHoveredNodeId(id);
  }, []);

  const directed = data.directed ?? false;

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col font-sans text-foreground bg-background"
    >
      <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
        {data.title && (
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle className="text-lg">{data.title}</CardTitle>
          </CardHeader>
        )}

        <CardContent ref={containerRef} className="flex-1 min-h-0 p-0 overflow-hidden">
          <svg
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          >
            {/* Arrow marker definition for directed graphs */}
            {directed && (
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="currentColor"
                    className="text-muted-foreground"
                  />
                </marker>
                <marker
                  id="arrowhead-dim"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="currentColor"
                    className="text-muted-foreground/30"
                  />
                </marker>
              </defs>
            )}

            {/* Edges */}
            {data.edges.map((edge, i) => {
              const sourceNode = nodePositions.get(edge.source);
              const targetNode = nodePositions.get(edge.target);
              if (!sourceNode || !targetNode) return null;

              const isHighlighted =
                !hoveredNodeId ||
                (connectedIds.has(edge.source) && connectedIds.has(edge.target));

              // Shorten line to stop at node edge for directed graphs
              const dx = targetNode.x - sourceNode.x;
              const dy = targetNode.y - sourceNode.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              let x2 = targetNode.x;
              let y2 = targetNode.y;
              if (directed && dist > 0) {
                const shortenBy = targetNode.radius + 4;
                x2 = targetNode.x - (dx / dist) * shortenBy;
                y2 = targetNode.y - (dy / dist) * shortenBy;
              }

              const edgeColor = edge.color ?? undefined;
              const weight = edge.weight ?? 1;
              const strokeWidth = Math.max(1, Math.min(4, weight));

              return (
                <g key={`edge-${i}`}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={x2}
                    y2={y2}
                    stroke={edgeColor}
                    strokeWidth={strokeWidth}
                    className={
                      edgeColor
                        ? undefined
                        : isHighlighted
                          ? "stroke-muted-foreground"
                          : "stroke-muted-foreground/20"
                    }
                    style={
                      edgeColor
                        ? { opacity: isHighlighted ? 1 : 0.2 }
                        : undefined
                    }
                    markerEnd={directed ? (isHighlighted ? "url(#arrowhead)" : "url(#arrowhead-dim)") : undefined}
                  />
                  {/* Edge label */}
                  {edge.label && (
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 6}
                      textAnchor="middle"
                      className={`text-[10px] fill-muted-foreground ${isHighlighted ? "opacity-100" : "opacity-20"}`}
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {simNodes.map((node) => {
              const isHighlighted = !hoveredNodeId || connectedIds.has(node.id);
              const isHovered = hoveredNodeId === node.id;

              return (
                <g
                  key={node.id}
                  onMouseEnter={() => handleNodeHover(node.id)}
                  onMouseLeave={() => handleNodeHover(null)}
                  className="cursor-pointer"
                  style={{ opacity: isHighlighted ? 1 : 0.2 }}
                >
                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHovered ? node.radius + 3 : node.radius}
                    fill={node.color}
                    fillOpacity={0.85}
                    stroke={isHovered ? node.color : "transparent"}
                    strokeWidth={isHovered ? 3 : 0}
                    strokeOpacity={0.4}
                    style={{ transition: "r 0.15s ease, stroke-width 0.15s ease" }}
                  />
                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + node.radius + 14}
                    textAnchor="middle"
                    className="text-[11px] fill-foreground font-medium"
                    style={{ pointerEvents: "none" }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>
    </motion.div>
  );
}
