import { useMemo } from "react";
import { useView } from "@chuk/view-shared";
import { Card, CardContent, cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { GaugeContent, GaugeThreshold } from "./schema";

export function GaugeView() {
  const { data } =
    useView<GaugeContent>("gauge", "1.0");

  if (!data) return null;

  return <GaugeRenderer data={data} />;
}

export interface GaugeRendererProps {
  data: GaugeContent;
}

const SIZE_CLASS: Record<string, string> = {
  sm: "max-w-[200px]",
  md: "max-w-[280px]",
  lg: "max-w-[360px]",
};

const ARC_PATH = "M 20 100 A 80 80 0 0 1 180 100";
const ARC_LENGTH = Math.PI * 80; // ~251.3

function getThresholdColor(
  value: number,
  thresholds?: GaugeThreshold[]
): string {
  if (!thresholds || thresholds.length === 0) return "currentColor";
  const sorted = [...thresholds].sort((a, b) => a.value - b.value);
  let color = sorted[0].color;
  for (const t of sorted) {
    if (value <= t.value) {
      color = t.color;
      break;
    }
    color = t.color;
  }
  return color;
}

function formatValue(
  value: number,
  format?: "number" | "percent",
  unit?: string
): string {
  if (format === "percent") {
    return `${Math.round(value)}%`;
  }
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
  return unit ? `${formatted}${unit}` : formatted;
}

export function GaugeRenderer({ data }: GaugeRendererProps) {
  const {
    title,
    value,
    min = 0,
    max = 100,
    unit,
    thresholds,
    format,
    size = "md",
    subtitle,
  } = data;

  const ratio = useMemo(() => {
    const clamped = Math.min(Math.max(value, min), max);
    return max === min ? 0 : (clamped - min) / (max - min);
  }, [value, min, max]);

  const valueColor = useMemo(
    () => getThresholdColor(value, thresholds),
    [value, thresholds]
  );

  const formattedValue = useMemo(
    () => formatValue(value, format, unit),
    [value, format, unit]
  );

  const sizeClass = SIZE_CLASS[size] ?? SIZE_CLASS.md;

  const thresholdArcs = useMemo(() => {
    if (!thresholds || thresholds.length === 0) return null;
    const sorted = [...thresholds].sort((a, b) => a.value - b.value);
    const segments: { start: number; end: number; color: string }[] = [];
    let prev = min;
    for (const t of sorted) {
      const segEnd = Math.min(t.value, max);
      if (segEnd > prev) {
        segments.push({
          start: (prev - min) / (max - min),
          end: (segEnd - min) / (max - min),
          color: t.color,
        });
      }
      prev = segEnd;
    }
    return segments;
  }, [thresholds, min, max]);

  return (
    <div className="h-full flex items-center justify-center font-sans text-foreground bg-background p-4">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className={cn("w-full", sizeClass)}
      >
        <Card>
          <CardContent className="p-6 text-center">
            {title && (
              <div className="text-sm font-medium text-muted-foreground mb-3">
                {title}
              </div>
            )}

            <svg viewBox="0 0 200 120" className="w-full" aria-hidden="true">
              {/* Background arc */}
              <path
                d={ARC_PATH}
                fill="none"
                className="stroke-muted"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={ARC_LENGTH}
                strokeDashoffset="0"
              />

              {/* Threshold zone arcs */}
              {thresholdArcs?.map((seg, i) => (
                <path
                  key={i}
                  d={ARC_PATH}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeLinecap="butt"
                  strokeDasharray={ARC_LENGTH}
                  strokeDashoffset={ARC_LENGTH * (1 - seg.end)}
                  opacity="0.2"
                  style={{
                    clipPath: `inset(0 ${100 - seg.end * 100}% 0 ${seg.start * 100}%)`,
                  }}
                />
              ))}

              {/* Value arc */}
              <path
                d={ARC_PATH}
                fill="none"
                stroke={valueColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={ARC_LENGTH}
                strokeDashoffset={ARC_LENGTH * (1 - ratio)}
                style={{
                  transition: "stroke-dashoffset 0.6s ease",
                }}
              />

              {/* Center value text */}
              <text
                x="100"
                y="95"
                textAnchor="middle"
                className="fill-foreground"
                fontSize="24"
                fontWeight="bold"
              >
                {formattedValue}
              </text>
            </svg>

            {subtitle && (
              <div className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
