import { useMemo } from "react";
import { useView } from "@chuk/view-shared";
import { Card, CardContent, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { BoxplotContent } from "./schema";

/* ------------------------------------------------------------------ */
/*  Default colour palette (theme-aware, high contrast)               */
/* ------------------------------------------------------------------ */

const DEFAULT_COLORS = [
  "#3388ff",
  "#ff6384",
  "#36a2eb",
  "#ffce56",
  "#4bc0c0",
  "#9966ff",
  "#ff9f40",
  "#c9cbcf",
];

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const PADDING = { top: 40, right: 30, bottom: 50, left: 60 };
const SVG_WIDTH = 600;
const SVG_HEIGHT = 360;
const PLOT_W = SVG_WIDTH - PADDING.left - PADDING.right;
const PLOT_H = SVG_HEIGHT - PADDING.top - PADDING.bottom;

const H_PADDING = { top: 40, right: 50, bottom: 30, left: 100 };
const H_SVG_WIDTH = 600;
const H_SVG_HEIGHT = 360;
const H_PLOT_W = H_SVG_WIDTH - H_PADDING.left - H_PADDING.right;
const H_PLOT_H = H_SVG_HEIGHT - H_PADDING.top - H_PADDING.bottom;

const TICK_COUNT = 5;

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                    */
/* ------------------------------------------------------------------ */

function niceRange(
  dataMin: number,
  dataMax: number,
  axisMin?: number,
  axisMax?: number
): [number, number] {
  const lo = axisMin ?? dataMin;
  const hi = axisMax ?? dataMax;
  if (lo === hi) return [lo - 1, hi + 1];
  const padding = (hi - lo) * 0.08;
  return [axisMin ?? lo - padding, axisMax ?? hi + padding];
}

function generateTicks(min: number, max: number, count: number): number[] {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const val = min + step * i;
    return Math.round(val * 100) / 100;
  });
}

function formatTickValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

/* ------------------------------------------------------------------ */
/*  BoxplotView (connected via useView)                                */
/* ------------------------------------------------------------------ */

export function BoxplotView() {
  const { data } =
    useView<BoxplotContent>("boxplot", "1.0");

  if (!data) return null;

  return <BoxplotRenderer data={data} />;
}

/* ------------------------------------------------------------------ */
/*  BoxplotRenderer                                                    */
/* ------------------------------------------------------------------ */

export interface BoxplotRendererProps {
  data: BoxplotContent;
}

export function BoxplotRenderer({ data }: BoxplotRendererProps) {
  const {
    title,
    groups,
    orientation = "vertical",
    showOutliers = true,
    yAxis,
  } = data;

  const isHorizontal = orientation === "horizontal";

  /* Compute the value range across all groups */
  const [rangeMin, rangeMax] = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const g of groups) {
      lo = Math.min(lo, g.stats.min);
      hi = Math.max(hi, g.stats.max);
      if (showOutliers && g.stats.outliers) {
        for (const o of g.stats.outliers) {
          lo = Math.min(lo, o);
          hi = Math.max(hi, o);
        }
      }
    }
    return niceRange(lo, hi, yAxis?.min, yAxis?.max);
  }, [groups, showOutliers, yAxis]);

  const ticks = useMemo(
    () => generateTicks(rangeMin, rangeMax, TICK_COUNT),
    [rangeMin, rangeMax]
  );

  /* Map a data value to a pixel position on the value axis */
  const scaleValue = useMemo(() => {
    const extent = rangeMax - rangeMin;
    if (isHorizontal) {
      return (v: number) =>
        H_PADDING.left + ((v - rangeMin) / extent) * H_PLOT_W;
    }
    return (v: number) =>
      PADDING.top + PLOT_H - ((v - rangeMin) / extent) * PLOT_H;
  }, [rangeMin, rangeMax, isHorizontal]);

  if (isHorizontal) {
    return (
      <div className="h-full flex items-center justify-center font-sans text-foreground bg-background p-4">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className={cn("w-full max-w-[640px]")}
        >
          <Card>
            <CardContent className="p-6">
              {title && (
                <div className="text-sm font-medium text-muted-foreground mb-3 text-center">
                  {title}
                </div>
              )}
              <svg
                viewBox={`0 0 ${H_SVG_WIDTH} ${H_SVG_HEIGHT}`}
                className="w-full"
                role="img"
                aria-label={title ?? "Box plot"}
              >
                {/* Value axis (x for horizontal) */}
                <line
                  x1={H_PADDING.left}
                  y1={H_PADDING.top + H_PLOT_H}
                  x2={H_PADDING.left + H_PLOT_W}
                  y2={H_PADDING.top + H_PLOT_H}
                  className="stroke-muted-foreground"
                  strokeWidth="1"
                />
                {ticks.map((t, i) => {
                  const x = scaleValue(t);
                  return (
                    <g key={i}>
                      <line
                        x1={x}
                        y1={H_PADDING.top + H_PLOT_H}
                        x2={x}
                        y2={H_PADDING.top + H_PLOT_H + 6}
                        className="stroke-muted-foreground"
                        strokeWidth="1"
                      />
                      <line
                        x1={x}
                        y1={H_PADDING.top}
                        x2={x}
                        y2={H_PADDING.top + H_PLOT_H}
                        className="stroke-muted"
                        strokeWidth="0.5"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={x}
                        y={H_PADDING.top + H_PLOT_H + 20}
                        textAnchor="middle"
                        className="fill-muted-foreground"
                        fontSize="11"
                      >
                        {formatTickValue(t)}
                      </text>
                    </g>
                  );
                })}

                {/* Y-axis label (value axis label) at bottom center */}
                {yAxis?.label && (
                  <text
                    x={H_SVG_WIDTH / 2}
                    y={H_SVG_HEIGHT - 4}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize="12"
                    fontWeight="500"
                  >
                    {yAxis.label}
                  </text>
                )}

                {/* Category axis (y for horizontal) */}
                <line
                  x1={H_PADDING.left}
                  y1={H_PADDING.top}
                  x2={H_PADDING.left}
                  y2={H_PADDING.top + H_PLOT_H}
                  className="stroke-muted-foreground"
                  strokeWidth="1"
                />

                {/* Render each group as a horizontal box */}
                {groups.map((group, i) => {
                  const bandH = H_PLOT_H / groups.length;
                  const cy = H_PADDING.top + bandH * i + bandH / 2;
                  const boxH = bandH * 0.5;
                  const color =
                    group.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];

                  const xMin = scaleValue(group.stats.min);
                  const xQ1 = scaleValue(group.stats.q1);
                  const xMedian = scaleValue(group.stats.median);
                  const xQ3 = scaleValue(group.stats.q3);
                  const xMax = scaleValue(group.stats.max);

                  return (
                    <g key={i}>
                      {/* Group label on y-axis */}
                      <text
                        x={H_PADDING.left - 8}
                        y={cy + 4}
                        textAnchor="end"
                        className="fill-foreground"
                        fontSize="12"
                      >
                        {group.label}
                      </text>

                      {/* Whisker line: min to max */}
                      <line
                        x1={xMin}
                        y1={cy}
                        x2={xMax}
                        y2={cy}
                        stroke={color}
                        strokeWidth="1.5"
                      />

                      {/* Cap at min */}
                      <line
                        x1={xMin}
                        y1={cy - boxH * 0.4}
                        x2={xMin}
                        y2={cy + boxH * 0.4}
                        stroke={color}
                        strokeWidth="1.5"
                      />

                      {/* Cap at max */}
                      <line
                        x1={xMax}
                        y1={cy - boxH * 0.4}
                        x2={xMax}
                        y2={cy + boxH * 0.4}
                        stroke={color}
                        strokeWidth="1.5"
                      />

                      {/* IQR box: Q1 to Q3 */}
                      <rect
                        x={xQ1}
                        y={cy - boxH / 2}
                        width={xQ3 - xQ1}
                        height={boxH}
                        fill={color}
                        fillOpacity="0.2"
                        stroke={color}
                        strokeWidth="1.5"
                        rx="2"
                      />

                      {/* Median line */}
                      <line
                        x1={xMedian}
                        y1={cy - boxH / 2}
                        x2={xMedian}
                        y2={cy + boxH / 2}
                        stroke={color}
                        strokeWidth="2.5"
                      />

                      {/* Mean diamond */}
                      {group.stats.mean !== undefined && (
                        <polygon
                          points={`${scaleValue(group.stats.mean)},${cy - 5} ${scaleValue(group.stats.mean) + 4},${cy} ${scaleValue(group.stats.mean)},${cy + 5} ${scaleValue(group.stats.mean) - 4},${cy}`}
                          fill={color}
                          stroke={color}
                          strokeWidth="1"
                        />
                      )}

                      {/* Outliers */}
                      {showOutliers &&
                        group.stats.outliers?.map((o, oi) => (
                          <circle
                            key={oi}
                            cx={scaleValue(o)}
                            cy={cy}
                            r="3"
                            fill="none"
                            stroke={color}
                            strokeWidth="1.5"
                          />
                        ))}
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

  /* ---- Vertical orientation (default) ---- */

  return (
    <div className="h-full flex items-center justify-center font-sans text-foreground bg-background p-4">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className={cn("w-full max-w-[640px]")}
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
              aria-label={title ?? "Box plot"}
            >
              {/* Y-axis */}
              <line
                x1={PADDING.left}
                y1={PADDING.top}
                x2={PADDING.left}
                y2={PADDING.top + PLOT_H}
                className="stroke-muted-foreground"
                strokeWidth="1"
              />
              {ticks.map((t, i) => {
                const y = scaleValue(t);
                return (
                  <g key={i}>
                    <line
                      x1={PADDING.left - 6}
                      y1={y}
                      x2={PADDING.left}
                      y2={y}
                      className="stroke-muted-foreground"
                      strokeWidth="1"
                    />
                    <line
                      x1={PADDING.left}
                      y1={y}
                      x2={PADDING.left + PLOT_W}
                      y2={y}
                      className="stroke-muted"
                      strokeWidth="0.5"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={PADDING.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-muted-foreground"
                      fontSize="11"
                    >
                      {formatTickValue(t)}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis label */}
              {yAxis?.label && (
                <text
                  x={14}
                  y={SVG_HEIGHT / 2}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize="12"
                  fontWeight="500"
                  transform={`rotate(-90, 14, ${SVG_HEIGHT / 2})`}
                >
                  {yAxis.label}
                </text>
              )}

              {/* X-axis */}
              <line
                x1={PADDING.left}
                y1={PADDING.top + PLOT_H}
                x2={PADDING.left + PLOT_W}
                y2={PADDING.top + PLOT_H}
                className="stroke-muted-foreground"
                strokeWidth="1"
              />

              {/* Render each group as a vertical box */}
              {groups.map((group, i) => {
                const bandW = PLOT_W / groups.length;
                const cx = PADDING.left + bandW * i + bandW / 2;
                const boxW = bandW * 0.5;
                const color =
                  group.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];

                const yMin = scaleValue(group.stats.min);
                const yQ1 = scaleValue(group.stats.q1);
                const yMedian = scaleValue(group.stats.median);
                const yQ3 = scaleValue(group.stats.q3);
                const yMax = scaleValue(group.stats.max);

                return (
                  <g key={i}>
                    {/* Group label below x-axis */}
                    <text
                      x={cx}
                      y={PADDING.top + PLOT_H + 20}
                      textAnchor="middle"
                      className="fill-foreground"
                      fontSize="12"
                    >
                      {group.label}
                    </text>

                    {/* Whisker line: min to max (vertical) */}
                    <line
                      x1={cx}
                      y1={yMax}
                      x2={cx}
                      y2={yMin}
                      stroke={color}
                      strokeWidth="1.5"
                    />

                    {/* Cap at min (bottom in screen coords = higher y) */}
                    <line
                      x1={cx - boxW * 0.4}
                      y1={yMin}
                      x2={cx + boxW * 0.4}
                      y2={yMin}
                      stroke={color}
                      strokeWidth="1.5"
                    />

                    {/* Cap at max (top in screen coords = lower y) */}
                    <line
                      x1={cx - boxW * 0.4}
                      y1={yMax}
                      x2={cx + boxW * 0.4}
                      y2={yMax}
                      stroke={color}
                      strokeWidth="1.5"
                    />

                    {/* IQR box: Q1 to Q3 */}
                    <rect
                      x={cx - boxW / 2}
                      y={yQ3}
                      width={boxW}
                      height={yQ1 - yQ3}
                      fill={color}
                      fillOpacity="0.2"
                      stroke={color}
                      strokeWidth="1.5"
                      rx="2"
                    />

                    {/* Median line */}
                    <line
                      x1={cx - boxW / 2}
                      y1={yMedian}
                      x2={cx + boxW / 2}
                      y2={yMedian}
                      stroke={color}
                      strokeWidth="2.5"
                    />

                    {/* Mean diamond */}
                    {group.stats.mean !== undefined && (
                      <polygon
                        points={`${cx},${scaleValue(group.stats.mean) - 5} ${cx + 4},${scaleValue(group.stats.mean)} ${cx},${scaleValue(group.stats.mean) + 5} ${cx - 4},${scaleValue(group.stats.mean)}`}
                        fill={color}
                        stroke={color}
                        strokeWidth="1"
                      />
                    )}

                    {/* Outliers */}
                    {showOutliers &&
                      group.stats.outliers?.map((o, oi) => (
                        <circle
                          key={oi}
                          cx={cx}
                          cy={scaleValue(o)}
                          r="3"
                          fill="none"
                          stroke={color}
                          strokeWidth="1.5"
                        />
                      ))}
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
