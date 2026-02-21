import { useMemo } from "react";
import { useView, Fallback } from "@chuk/view-shared";
import { Card, CardContent } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { FunnelContent, FunnelStage } from "./schema";

/* ------------------------------------------------------------------ */
/*  Default colors — gradient from primary to lighter shades           */
/* ------------------------------------------------------------------ */

const DEFAULT_COLORS = [
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#dbeafe",
  "#eff6ff",
  "#c7d2fe",
  "#a5b4fc",
];

function stageColor(stage: FunnelStage, index: number): string {
  return stage.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

/* ------------------------------------------------------------------ */
/*  View (wired to MCP)                                                */
/* ------------------------------------------------------------------ */

export function FunnelView() {
  const { data, content, isConnected } =
    useView<FunnelContent>("funnel", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <FunnelRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  Renderer (pure presentation)                                       */
/* ------------------------------------------------------------------ */

export interface FunnelRendererProps {
  data: FunnelContent;
}

const SVG_WIDTH = 400;
const STAGE_HEIGHT = 48;
const GAP = 6;
const MIN_WIDTH_RATIO = 0.15;

export function FunnelRenderer({ data }: FunnelRendererProps) {
  const { title, stages, showConversion = false } = data;

  const maxValue = useMemo(
    () => (stages.length > 0 ? stages[0].value : 1),
    [stages],
  );

  const conversionHeight = showConversion ? 24 : 0;
  const totalHeight =
    stages.length * STAGE_HEIGHT +
    (stages.length - 1) * (GAP + conversionHeight) +
    20;

  return (
    <div className="h-full flex items-center justify-center font-sans text-foreground bg-background p-4">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[520px]"
      >
        <Card>
          <CardContent className="p-6">
            {title && (
              <div className="text-sm font-medium text-muted-foreground mb-3 text-center">
                {title}
              </div>
            )}

            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${totalHeight}`}
              className="w-full"
              role="img"
              aria-label={title ?? "Funnel chart"}
            >
              {stages.map((stage, i) => {
                const widthRatio = Math.max(
                  stage.value / maxValue,
                  MIN_WIDTH_RATIO,
                );
                const nextWidthRatio =
                  i < stages.length - 1
                    ? Math.max(stages[i + 1].value / maxValue, MIN_WIDTH_RATIO)
                    : widthRatio;

                const topWidth = widthRatio * SVG_WIDTH;
                const bottomWidth = nextWidthRatio * SVG_WIDTH;
                const yOffset =
                  i * (STAGE_HEIGHT + GAP + conversionHeight) + 10;

                const topLeft = (SVG_WIDTH - topWidth) / 2;
                const topRight = (SVG_WIDTH + topWidth) / 2;
                const bottomLeft = (SVG_WIDTH - bottomWidth) / 2;
                const bottomRight = (SVG_WIDTH + bottomWidth) / 2;

                const color = stageColor(stage, i);

                const conversionRate =
                  showConversion && i < stages.length - 1 && stage.value > 0
                    ? ((stages[i + 1].value / stage.value) * 100).toFixed(1)
                    : null;

                return (
                  <g key={i}>
                    {/* Trapezoid */}
                    <polygon
                      points={`${topLeft},${yOffset} ${topRight},${yOffset} ${bottomRight},${yOffset + STAGE_HEIGHT} ${bottomLeft},${yOffset + STAGE_HEIGHT}`}
                      fill={color}
                      opacity="0.85"
                    />

                    {/* Label */}
                    <text
                      x={SVG_WIDTH / 2}
                      y={yOffset + STAGE_HEIGHT / 2 - 6}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-foreground"
                      fontSize="12"
                      fontWeight="600"
                    >
                      {stage.label}
                    </text>

                    {/* Value */}
                    <text
                      x={SVG_WIDTH / 2}
                      y={yOffset + STAGE_HEIGHT / 2 + 8}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-foreground"
                      fontSize="10"
                      opacity="0.7"
                    >
                      {formatNumber(stage.value)}
                    </text>

                    {/* Conversion rate between stages */}
                    {conversionRate !== null && (
                      <text
                        x={SVG_WIDTH / 2}
                        y={yOffset + STAGE_HEIGHT + GAP + conversionHeight / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-muted-foreground"
                        fontSize="10"
                      >
                        {conversionRate}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Metadata display */}
            {stages.some((s) => s.metadata) && (
              <div className="mt-3 space-y-1">
                {stages
                  .filter((s) => s.metadata)
                  .map((stage, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap gap-2 text-xs text-muted-foreground"
                    >
                      <span className="font-medium">{stage.label}:</span>
                      {Object.entries(stage.metadata!).map(([k, v]) => (
                        <span key={k}>
                          {k}={v}
                        </span>
                      ))}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}
