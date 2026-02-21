import { useMemo } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { NeuralContent, NeuralLayer } from "./schema";

/* ------------------------------------------------------------------ */
/*  Color map by layer type                                            */
/* ------------------------------------------------------------------ */

const TYPE_COLORS: Record<NeuralLayer["type"], string> = {
  input: "#3b82f6",
  dense: "#22c55e",
  conv: "#8b5cf6",
  pooling: "#f59e0b",
  dropout: "#6b7280",
  output: "#ef4444",
};

function layerColor(layer: NeuralLayer): string {
  return layer.color ?? TYPE_COLORS[layer.type] ?? "#6b7280";
}

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const MAX_VISIBLE_NODES = 8;
const NODE_RADIUS = 10;
const NODE_GAP = 28;
const LAYER_GAP = 100;
const PADDING_X = 60;
const PADDING_TOP = 30;
const LABEL_HEIGHT = 50;

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                                */
/* ------------------------------------------------------------------ */

export function NeuralView() {
  const { data, content, isConnected } =
    useView<NeuralContent>("neural", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <NeuralRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                       */
/* ------------------------------------------------------------------ */

export interface NeuralRendererProps {
  data: NeuralContent;
}

interface NodePosition {
  x: number;
  y: number;
  isEllipsis: boolean;
}

export function NeuralRenderer({ data }: NeuralRendererProps) {
  const { title, layers, showWeights = false } = data;

  /* ---- compute node positions for each layer ---- */
  const layerNodes = useMemo(() => {
    return layers.map((layer, layerIdx) => {
      const x = PADDING_X + layerIdx * LAYER_GAP;
      const displayCount = Math.min(layer.units, MAX_VISIBLE_NODES);
      const hasEllipsis = layer.units > MAX_VISIBLE_NODES;
      const nodeCount = hasEllipsis ? displayCount + 1 : displayCount;

      const nodes: NodePosition[] = [];

      if (hasEllipsis) {
        /* Show top half, ellipsis, bottom half */
        const topCount = Math.ceil(displayCount / 2);
        const bottomCount = displayCount - topCount;
        for (let i = 0; i < topCount; i++) {
          nodes.push({
            x,
            y: PADDING_TOP + i * NODE_GAP,
            isEllipsis: false,
          });
        }
        nodes.push({
          x,
          y: PADDING_TOP + topCount * NODE_GAP,
          isEllipsis: true,
        });
        for (let i = 0; i < bottomCount; i++) {
          nodes.push({
            x,
            y: PADDING_TOP + (topCount + 1 + i) * NODE_GAP,
            isEllipsis: false,
          });
        }

        return { layer, nodes, totalSlots: nodeCount, x };
      }

      for (let i = 0; i < displayCount; i++) {
        nodes.push({
          x,
          y: PADDING_TOP + i * NODE_GAP,
          isEllipsis: false,
        });
      }

      return { layer, nodes, totalSlots: nodeCount, x };
    });
  }, [layers]);

  /* ---- compute SVG dimensions ---- */
  const maxNodes = useMemo(
    () => Math.max(...layerNodes.map((l) => l.totalSlots), 1),
    [layerNodes],
  );

  const svgWidth = PADDING_X * 2 + (layers.length - 1) * LAYER_GAP;
  const svgHeight =
    PADDING_TOP + maxNodes * NODE_GAP + LABEL_HEIGHT;

  /* ---- center each layer's nodes vertically ---- */
  const centeredLayerNodes = useMemo(() => {
    const maxHeight = (maxNodes - 1) * NODE_GAP;
    return layerNodes.map((ln) => {
      const layerHeight = (ln.totalSlots - 1) * NODE_GAP;
      const offsetY = (maxHeight - layerHeight) / 2;
      return {
        ...ln,
        nodes: ln.nodes.map((n) => ({
          ...n,
          y: n.y + offsetY,
        })),
      };
    });
  }, [layerNodes, maxNodes]);

  /* ---- connections between layers ---- */
  const connections = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < centeredLayerNodes.length - 1; i++) {
      const fromNodes = centeredLayerNodes[i].nodes.filter(
        (n) => !n.isEllipsis,
      );
      const toNodes = centeredLayerNodes[i + 1].nodes.filter(
        (n) => !n.isEllipsis,
      );
      for (const from of fromNodes) {
        for (const to of toNodes) {
          lines.push({
            x1: from.x,
            y1: from.y,
            x2: to.x,
            y2: to.y,
          });
        }
      }
    }
    return lines;
  }, [centeredLayerNodes]);

  return (
    <div className="h-full flex items-center justify-center font-sans text-foreground bg-background p-4">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[700px]"
      >
        <Card>
          <CardContent className="p-6">
            {title && (
              <div className="text-sm font-medium text-muted-foreground mb-3 text-center">
                {title}
              </div>
            )}

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full"
              role="img"
              aria-label={title ?? "Neural network diagram"}
            >
              {/* Connections */}
              {connections.map((c, i) => (
                <line
                  key={`conn-${i}`}
                  x1={c.x1}
                  y1={c.y1}
                  x2={c.x2}
                  y2={c.y2}
                  className="stroke-muted-foreground"
                  strokeWidth={showWeights ? 1.5 : 0.5}
                  opacity={showWeights ? 0.4 : 0.2}
                />
              ))}

              {/* Nodes */}
              {centeredLayerNodes.map((ln, layerIdx) =>
                ln.nodes.map((node, nodeIdx) =>
                  node.isEllipsis ? (
                    <text
                      key={`node-${layerIdx}-${nodeIdx}`}
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-muted-foreground"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      ...
                    </text>
                  ) : (
                    <circle
                      key={`node-${layerIdx}-${nodeIdx}`}
                      cx={node.x}
                      cy={node.y}
                      r={NODE_RADIUS}
                      fill={layerColor(ln.layer)}
                      opacity="0.85"
                      stroke={layerColor(ln.layer)}
                      strokeWidth="1.5"
                    />
                  ),
                ),
              )}

              {/* Layer labels */}
              {centeredLayerNodes.map((ln, layerIdx) => {
                const labelY =
                  PADDING_TOP + maxNodes * NODE_GAP + 10;

                return (
                  <g key={`label-${layerIdx}`}>
                    <text
                      x={ln.x}
                      y={labelY}
                      textAnchor="middle"
                      className="fill-foreground"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {ln.layer.name}
                    </text>
                    <text
                      x={ln.x}
                      y={labelY + 13}
                      textAnchor="middle"
                      className="fill-muted-foreground"
                      fontSize="9"
                    >
                      {ln.layer.type} ({ln.layer.units})
                    </text>
                    {ln.layer.activation && (
                      <text
                        x={ln.x}
                        y={labelY + 25}
                        textAnchor="middle"
                        className="fill-muted-foreground"
                        fontSize="8"
                        fontStyle="italic"
                      >
                        {ln.layer.activation}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
