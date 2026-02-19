import { useEffect, useRef, useCallback } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  LogarithmicScale,
  ScatterController,
  BubbleController,
  PointElement,
  Legend,
  Title,
  Tooltip,
} from "chart.js";
import { useView, Fallback } from "@chuk/view-shared";
import { cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { ScatterContent } from "./schema";

ChartJS.register(
  LinearScale,
  LogarithmicScale,
  ScatterController,
  BubbleController,
  PointElement,
  Legend,
  Title,
  Tooltip
);

const DEFAULT_COLORS = [
  "#3388ff", "#ff6384", "#36a2eb", "#ffce56",
  "#4bc0c0", "#9966ff", "#ff9f40", "#c9cbcf",
];

function getThemeColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    text: s.getPropertyValue("--chuk-color-text").trim() || "#1a1a1a",
    textSecondary: s.getPropertyValue("--chuk-color-text-secondary").trim() || "#666666",
    border: s.getPropertyValue("--chuk-color-border").trim() || "#e0e0e0",
  };
}

const POINT_STYLE_MAP: Record<string, string> = {
  circle: "circle",
  cross: "cross",
  rect: "rect",
  triangle: "triangle",
  star: "star",
};

export function ScatterView() {
  const { data, content, isConnected } =
    useView<ScatterContent>("scatter", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <ScatterRenderer data={data} />;
}

export interface ScatterRendererProps {
  data: ScatterContent;
}

export function ScatterRenderer({ data }: ScatterRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!data.zoom || !chartRef.current) return;
      e.preventDefault();

      const chart = chartRef.current;
      const factor = e.deltaY > 0 ? 1.1 : 0.9;

      const xScale = chart.scales.x;
      const yScale = chart.scales.y;

      if (xScale && yScale) {
        const xCenter = (xScale.min + xScale.max) / 2;
        const yCenter = (yScale.min + yScale.max) / 2;
        const xHalfRange = ((xScale.max - xScale.min) / 2) * factor;
        const yHalfRange = ((yScale.max - yScale.min) / 2) * factor;

        xScale.options.min = xCenter - xHalfRange;
        xScale.options.max = xCenter + xHalfRange;
        yScale.options.min = yCenter - yHalfRange;
        yScale.options.max = yCenter + yHalfRange;

        chart.update("none");
      }
    },
    [data.zoom]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const theme = getThemeColors();

    // Determine if any dataset has points with r values (bubble mode)
    const hasBubble = data.datasets.some((ds) =>
      ds.points.some((pt) => pt.r != null)
    );

    const chartType = hasBubble ? "bubble" : "scatter";

    const datasets = data.datasets.map((ds, i) => {
      const color = ds.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      const defaultRadius = ds.pointRadius ?? 4;

      const points = ds.points.map((pt) => ({
        x: pt.x,
        y: pt.y,
        r: pt.r ?? defaultRadius,
      }));

      return {
        label: ds.label,
        data: points,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        pointStyle: POINT_STYLE_MAP[ds.pointStyle ?? "circle"] ?? "circle",
        pointRadius: hasBubble ? undefined : defaultRadius,
        hoverRadius: hasBubble ? undefined : defaultRadius + 2,
      };
    });

    // Build tooltip callback that shows point label and metadata
    const pointLabelMap = new Map<string, { label?: string; metadata?: Record<string, string> }>();
    data.datasets.forEach((ds, di) => {
      ds.points.forEach((pt, pi) => {
        if (pt.label || pt.metadata) {
          pointLabelMap.set(`${di}-${pi}`, {
            label: pt.label,
            metadata: pt.metadata,
          });
        }
      });
    });

    chartRef.current = new ChartJS(canvas, {
      type: chartType,
      data: { datasets: datasets as never },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        color: theme.text,
        interaction: {
          intersect: true,
          mode: "nearest",
        },
        plugins: {
          title: {
            display: !!data.title,
            text: data.title,
            color: theme.text,
            font: { size: 16, weight: "bold" as const },
          },
          subtitle: {
            display: !!data.subtitle,
            text: data.subtitle,
            color: theme.textSecondary,
            font: { size: 13 },
          },
          legend: {
            display: data.legend?.position !== "none",
            position: (data.legend?.position === "none" ? "top" : data.legend?.position) ?? "top",
            labels: { color: theme.text },
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label(ctx) {
                const dsIndex = ctx.datasetIndex;
                const ptIndex = ctx.dataIndex;
                const key = `${dsIndex}-${ptIndex}`;
                const info = pointLabelMap.get(key);
                const raw = ctx.raw as { x: number; y: number; r?: number };

                const parts: string[] = [];

                if (info?.label) {
                  parts.push(info.label);
                } else {
                  parts.push(`${ctx.dataset.label}`);
                }

                parts.push(`(${raw.x}, ${raw.y})`);

                if (raw.r != null && hasBubble) {
                  parts.push(`r: ${raw.r}`);
                }

                if (info?.metadata) {
                  for (const [k, v] of Object.entries(info.metadata)) {
                    parts.push(`${k}: ${v}`);
                  }
                }

                return parts.join(" | ");
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: !!data.xAxis?.label,
              text: data.xAxis?.label,
              color: theme.text,
            },
            ticks: { color: theme.textSecondary },
            grid: { color: theme.border },
            type: (data.xAxis?.type ?? "linear") as never,
            min: data.xAxis?.min,
            max: data.xAxis?.max,
          },
          y: {
            display: true,
            title: {
              display: !!data.yAxis?.label,
              text: data.yAxis?.label,
              color: theme.text,
            },
            ticks: { color: theme.textSecondary },
            grid: { color: theme.border },
            type: (data.yAxis?.type ?? "linear") as never,
            min: data.yAxis?.min,
            max: data.yAxis?.max,
          },
        },
      },
    });

    // Attach zoom handler
    if (data.zoom) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, handleWheel]);

  return (
    <div className={cn(
      "w-full h-full p-4 font-sans bg-background",
      "flex items-center justify-center"
    )}>
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="w-full h-full"
      >
        <canvas ref={canvasRef} />
      </motion.div>
    </div>
  );
}
