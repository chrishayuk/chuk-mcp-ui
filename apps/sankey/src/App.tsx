import { useState, useMemo, useCallback } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { SankeyContent, SankeyNode, SankeyLink } from "./schema";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PALETTE = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
  "#a855f7", "#84cc16", "#e11d48", "#0ea5e9", "#d946ef",
  "#10b981",
];

const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;
const NODE_WIDTH = 18;
const NODE_PAD = 12;
const MARGIN = { top: 20, right: 20, bottom: 20, left: 20 };

/* ------------------------------------------------------------------ */
/*  Layout types                                                       */
/* ------------------------------------------------------------------ */

interface LayoutNode {
  node: SankeyNode;
  layer: number;
  x: number;
  y: number;
  height: number;
  color: string;
  totalValue: number;
}

interface LayoutLink {
  link: SankeyLink;
  sourceNode: LayoutNode;
  targetNode: LayoutNode;
  sourceY: number;
  targetY: number;
  width: number;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Layout algorithm                                                   */
/* ------------------------------------------------------------------ */

function computeLayout(
  nodes: SankeyNode[],
  links: SankeyLink[],
): { layoutNodes: LayoutNode[]; layoutLinks: LayoutLink[] } {
  if (nodes.length === 0) {
    return { layoutNodes: [], layoutLinks: [] };
  }

  const nodeMap = new Map<string, SankeyNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  /* 1. Determine layers via longest path from sources */
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();
  for (const n of nodes) {
    incoming.set(n.id, []);
    outgoing.set(n.id, []);
  }
  for (const link of links) {
    outgoing.get(link.source)?.push(link.target);
    incoming.get(link.target)?.push(link.source);
  }

  // Longest path via BFS-like topological approach
  const layer = new Map<string, number>();
  const sources = nodes.filter(
    (n) => (incoming.get(n.id)?.length ?? 0) === 0,
  );

  // If no pure sources, start from all nodes with layer 0
  if (sources.length === 0) {
    for (const n of nodes) {
      layer.set(n.id, 0);
    }
  } else {
    // Initialize all to 0
    for (const n of nodes) {
      layer.set(n.id, 0);
    }
    // BFS forward pass: longest path
    const queue = sources.map((n) => n.id);
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentLayer = layer.get(current) ?? 0;
      for (const target of outgoing.get(current) ?? []) {
        const prevLayer = layer.get(target) ?? 0;
        if (currentLayer + 1 > prevLayer) {
          layer.set(target, currentLayer + 1);
          queue.push(target);
        }
      }
    }
  }

  const maxLayer = Math.max(...Array.from(layer.values()), 0);
  const layerCount = maxLayer + 1;

  /* 2. Compute total value per node (sum of incoming or outgoing, whichever is larger) */
  const nodeValue = new Map<string, number>();
  for (const n of nodes) {
    let inVal = 0;
    let outVal = 0;
    for (const link of links) {
      if (link.target === n.id) inVal += link.value;
      if (link.source === n.id) outVal += link.value;
    }
    nodeValue.set(n.id, Math.max(inVal, outVal, 1));
  }

  /* 3. Group nodes by layer */
  const layerGroups: SankeyNode[][] = Array.from({ length: layerCount }, () => []);
  for (const n of nodes) {
    const l = layer.get(n.id) ?? 0;
    layerGroups[l].push(n);
  }

  /* 4. Position nodes */
  const innerWidth =
    SVG_WIDTH - MARGIN.left - MARGIN.right - NODE_WIDTH;
  const innerHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
  const layerSpacing = layerCount > 1 ? innerWidth / (layerCount - 1) : 0;

  const layoutNodes: LayoutNode[] = [];
  const layoutNodeMap = new Map<string, LayoutNode>();

  for (let l = 0; l < layerCount; l++) {
    const group = layerGroups[l];
    const totalGroupValue = group.reduce(
      (sum, n) => sum + (nodeValue.get(n.id) ?? 1),
      0,
    );

    // Available height for this column
    const totalPadding = (group.length - 1) * NODE_PAD;
    const availableHeight = innerHeight - totalPadding;
    const scale = totalGroupValue > 0 ? availableHeight / totalGroupValue : 0;

    let y = MARGIN.top;
    const x = MARGIN.left + (layerCount > 1 ? l * layerSpacing : innerWidth / 2);

    for (let i = 0; i < group.length; i++) {
      const n = group[i];
      const val = nodeValue.get(n.id) ?? 1;
      const height = Math.max(val * scale, 2);
      const color = n.color ?? PALETTE[layoutNodes.length % PALETTE.length];

      const ln: LayoutNode = {
        node: n,
        layer: l,
        x,
        y,
        height,
        color,
        totalValue: val,
      };
      layoutNodes.push(ln);
      layoutNodeMap.set(n.id, ln);

      y += height + NODE_PAD;
    }
  }

  /* 5. Position links */
  // Track used vertical space on source (right side) and target (left side)
  const sourceOffset = new Map<string, number>();
  const targetOffset = new Map<string, number>();
  for (const n of nodes) {
    sourceOffset.set(n.id, 0);
    targetOffset.set(n.id, 0);
  }

  const layoutLinks: LayoutLink[] = [];

  // Sort links to produce more consistent ordering
  const sortedLinks = [...links].sort((a, b) => {
    const aSource = layoutNodeMap.get(a.source);
    const bSource = layoutNodeMap.get(b.source);
    if (aSource && bSource && aSource.y !== bSource.y) {
      return aSource.y - bSource.y;
    }
    return b.value - a.value;
  });

  for (const link of sortedLinks) {
    const sn = layoutNodeMap.get(link.source);
    const tn = layoutNodeMap.get(link.target);
    if (!sn || !tn) continue;

    const totalSourceValue = nodeValue.get(link.source) ?? 1;
    const totalTargetValue = nodeValue.get(link.target) ?? 1;

    const linkWidth = Math.max(
      (link.value / Math.max(totalSourceValue, 1)) * sn.height,
      1,
    );

    const sOff = sourceOffset.get(link.source) ?? 0;
    const tOff = targetOffset.get(link.target) ?? 0;

    const sourceY = sn.y + sOff + linkWidth / 2;
    const targetY =
      tn.y +
      tOff +
      Math.max(
        (link.value / Math.max(totalTargetValue, 1)) * tn.height,
        1,
      ) / 2;

    sourceOffset.set(link.source, sOff + linkWidth);
    targetOffset.set(
      link.target,
      tOff +
        Math.max(
          (link.value / Math.max(totalTargetValue, 1)) * tn.height,
          1,
        ),
    );

    const color = link.color ?? sn.color;

    layoutLinks.push({
      link,
      sourceNode: sn,
      targetNode: tn,
      sourceY,
      targetY,
      width: linkWidth,
      color,
    });
  }

  return { layoutNodes, layoutLinks };
}

/* ------------------------------------------------------------------ */
/*  Link path helper                                                   */
/* ------------------------------------------------------------------ */

function linkPath(ll: LayoutLink): string {
  const x0 = ll.sourceNode.x + NODE_WIDTH;
  const x1 = ll.targetNode.x;
  const mx = (x0 + x1) / 2;

  return `M ${x0},${ll.sourceY}
    C ${mx},${ll.sourceY} ${mx},${ll.targetY} ${x1},${ll.targetY}`;
}

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                                */
/* ------------------------------------------------------------------ */

export function SankeyView() {
  const { data, content, isConnected } =
    useView<SankeyContent>("sankey", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <SankeyRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer props                                                     */
/* ------------------------------------------------------------------ */

export interface SankeyRendererProps {
  data: SankeyContent;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                       */
/* ------------------------------------------------------------------ */

export function SankeyRenderer({ data }: SankeyRendererProps) {
  const { title, nodes, links } = data;

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{
    x: number;
    y: number;
    text: string;
    detail: string;
  } | null>(null);

  const { layoutNodes, layoutLinks } = useMemo(
    () => computeLayout(nodes, links),
    [nodes, links],
  );

  const handleNodeEnter = useCallback(
    (nodeId: string, ln: LayoutNode) => {
      setHoveredNode(nodeId);
      setTooltipInfo({
        x: ln.x + NODE_WIDTH / 2,
        y: ln.y - 8,
        text: ln.node.label,
        detail: `Total: ${ln.totalValue}`,
      });
    },
    [],
  );

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null);
    setTooltipInfo(null);
  }, []);

  const handleLinkEnter = useCallback(
    (index: number, ll: LayoutLink) => {
      setHoveredLink(index);
      const midX = (ll.sourceNode.x + NODE_WIDTH + ll.targetNode.x) / 2;
      const midY = (ll.sourceY + ll.targetY) / 2;
      setTooltipInfo({
        x: midX,
        y: midY - 8,
        text: `${ll.sourceNode.node.label} \u2192 ${ll.targetNode.node.label}`,
        detail: `Value: ${ll.link.value}`,
      });
    },
    [],
  );

  const handleLinkLeave = useCallback(() => {
    setHoveredLink(null);
    setTooltipInfo(null);
  }, []);

  return (
    <div className="h-full flex items-center justify-center font-sans text-foreground bg-background p-4">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className={cn("w-full max-w-[900px]")}
      >
        <Card>
          <CardContent className="p-6">
            {title && (
              <div className="text-sm font-medium text-muted-foreground mb-3 text-center">
                {title}
              </div>
            )}

            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="w-full"
              role="img"
              aria-label={title ?? "Sankey diagram"}
            >
              {/* Links */}
              {layoutLinks.map((ll, i) => {
                const isHighlighted =
                  hoveredLink === i ||
                  hoveredNode === ll.link.source ||
                  hoveredNode === ll.link.target;
                const isDimmed =
                  (hoveredNode !== null || hoveredLink !== null) &&
                  !isHighlighted;

                return (
                  <path
                    key={`link-${i}`}
                    d={linkPath(ll)}
                    fill="none"
                    stroke={ll.color}
                    strokeWidth={Math.max(ll.width, 1)}
                    strokeOpacity={isDimmed ? 0.1 : isHighlighted ? 0.6 : 0.35}
                    style={{
                      cursor: "pointer",
                      transition: "stroke-opacity 0.2s ease",
                    }}
                    onMouseEnter={() => handleLinkEnter(i, ll)}
                    onMouseLeave={handleLinkLeave}
                  />
                );
              })}

              {/* Nodes */}
              {layoutNodes.map((ln) => {
                const isHighlighted = hoveredNode === ln.node.id;
                const hasHover = hoveredNode !== null || hoveredLink !== null;
                const isLinked =
                  hoveredLink !== null &&
                  (layoutLinks[hoveredLink]?.link.source === ln.node.id ||
                    layoutLinks[hoveredLink]?.link.target === ln.node.id);
                const isDimmed = hasHover && !isHighlighted && !isLinked;

                return (
                  <g key={ln.node.id}>
                    <rect
                      x={ln.x}
                      y={ln.y}
                      width={NODE_WIDTH}
                      height={ln.height}
                      fill={ln.color}
                      opacity={isDimmed ? 0.3 : 1}
                      rx={2}
                      style={{
                        cursor: "pointer",
                        transition: "opacity 0.2s ease",
                      }}
                      onMouseEnter={() => handleNodeEnter(ln.node.id, ln)}
                      onMouseLeave={handleNodeLeave}
                    />
                    {/* Node label */}
                    <text
                      x={
                        ln.layer === 0
                          ? ln.x - 4
                          : ln.x + NODE_WIDTH + 4
                      }
                      y={ln.y + ln.height / 2}
                      textAnchor={ln.layer === 0 ? "end" : "start"}
                      dominantBaseline="central"
                      className="fill-foreground pointer-events-none"
                      fontSize="11"
                      fontWeight="500"
                      opacity={isDimmed ? 0.3 : 1}
                      style={{ transition: "opacity 0.2s ease" }}
                    >
                      {ln.node.label}
                    </text>
                  </g>
                );
              })}

              {/* Tooltip */}
              {tooltipInfo && (
                <g className="pointer-events-none">
                  <rect
                    x={tooltipInfo.x - 60}
                    y={tooltipInfo.y - 34}
                    width={120}
                    height={30}
                    rx={4}
                    className="fill-popover stroke-border"
                    strokeWidth="1"
                  />
                  <text
                    x={tooltipInfo.x}
                    y={tooltipInfo.y - 24}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-foreground"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {tooltipInfo.text}
                  </text>
                  <text
                    x={tooltipInfo.x}
                    y={tooltipInfo.y - 12}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-muted-foreground"
                    fontSize="9"
                  >
                    {tooltipInfo.detail}
                  </text>
                </g>
              )}
            </svg>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
