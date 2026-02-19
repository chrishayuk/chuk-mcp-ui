import { useEffect, useRef, useCallback } from "react";
import {
  Chart as ChartJS,
  LineController,
  BarController,
  LinearScale,
  LogarithmicScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Legend,
  Title,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { useView, Fallback } from "@chuk/view-shared";
import { cn } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type {
  TimeseriesContent,
  TimeseriesSeries,
  TimeseriesAnnotation,
} from "./schema";

ChartJS.register(
  LineController,
  BarController,
  LinearScale,
  LogarithmicScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
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

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Custom Chart.js plugin that draws annotation lines and shaded ranges. */
const annotationPlugin = {
  id: "timeseriesAnnotations",
  afterDraw(chart: ChartJS, _args: unknown, _options: unknown) {
    const meta = (chart as unknown as { _timeseriesAnnotations?: TimeseriesAnnotation[] })
      ._timeseriesAnnotations;
    if (!meta || meta.length === 0) return;

    const ctx = chart.ctx;
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    if (!xScale || !yScale) return;

    ctx.save();

    for (const ann of meta) {
      const color = ann.color ?? "rgba(255, 99, 132, 0.5)";
      const startPx = xScale.getPixelForValue(new Date(ann.start).getTime());

      if (ann.type === "line") {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.moveTo(startPx, yScale.top);
        ctx.lineTo(startPx, yScale.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        if (ann.label) {
          ctx.fillStyle = color;
          ctx.font = "11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(ann.label, startPx, yScale.top - 6);
        }
      } else if (ann.type === "range" && ann.end) {
        const endPx = xScale.getPixelForValue(new Date(ann.end).getTime());
        ctx.fillStyle = withAlpha(
          color.startsWith("#") ? color : "#ff6384",
          0.15
        );
        ctx.fillRect(startPx, yScale.top, endPx - startPx, yScale.bottom - yScale.top);

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.moveTo(startPx, yScale.top);
        ctx.lineTo(startPx, yScale.bottom);
        ctx.moveTo(endPx, yScale.top);
        ctx.lineTo(endPx, yScale.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        if (ann.label) {
          ctx.fillStyle = color;
          ctx.font = "11px sans-serif";
          ctx.textAlign = "center";
          const midPx = (startPx + endPx) / 2;
          ctx.fillText(ann.label, midPx, yScale.top - 6);
        }
      }
    }

    ctx.restore();
  },
};

ChartJS.register(annotationPlugin);

function mapSeriesData(series: TimeseriesSeries) {
  return series.data.map((pt) => ({
    x: new Date(pt.t),
    y: pt.v,
  }));
}

export function TimeseriesView() {
  const { data, content, isConnected } =
    useView<TimeseriesContent>("timeseries", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <TimeseriesRenderer data={data} />;
}

export interface TimeseriesRendererProps {
  data: TimeseriesContent;
}

export function TimeseriesRenderer({ data }: TimeseriesRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!data.zoom || !chartRef.current) return;
      e.preventDefault();

      const chart = chartRef.current;
      const factor = e.deltaY > 0 ? 1.1 : 0.9;

      const xScale = chart.scales.x;
      if (xScale) {
        const xCenter = (xScale.min + xScale.max) / 2;
        const xHalfRange = ((xScale.max - xScale.min) / 2) * factor;

        xScale.options.min = xCenter - xHalfRange;
        xScale.options.max = xCenter + xHalfRange;

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

    const datasets = data.series.map((series, i) => {
      const color = series.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      const isArea = series.type === "area";
      const chartType = isArea ? "line" : (series.type ?? "line");
      const shouldFill = isArea || series.fill || false;

      return {
        label: series.label,
        data: mapSeriesData(series),
        backgroundColor: shouldFill ? withAlpha(color, 0.2) : color,
        borderColor: color,
        borderWidth: 2,
        fill: shouldFill,
        tension: isArea ? 0.4 : 0,
        pointRadius: 3,
        pointHoverRadius: 5,
        type: chartType as "line" | "bar",
      };
    });

    // Determine the dominant chart type (first series or "line" default)
    const primaryType =
      data.series[0]?.type === "area"
        ? "line"
        : data.series[0]?.type === "bar"
          ? "bar"
          : "line";

    const chartInstance = new ChartJS(canvas, {
      type: primaryType,
      data: { datasets: datasets as never },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        color: theme.text,
        interaction: {
          intersect: false,
          mode: "index",
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
            display: data.series.length > 1,
            position: "top",
            labels: { color: theme.text },
          },
          tooltip: {
            enabled: true,
          },
        },
        scales: {
          x: {
            type: "time",
            display: true,
            title: {
              display: !!data.xAxis?.label,
              text: data.xAxis?.label,
              color: theme.text,
            },
            ticks: { color: theme.textSecondary },
            grid: { color: theme.border },
            min: data.xAxis?.min ? new Date(data.xAxis.min).getTime() : undefined,
            max: data.xAxis?.max ? new Date(data.xAxis.max).getTime() : undefined,
          } as never,
          y: {
            type: (data.yAxis?.type ?? "linear") as "linear" | "logarithmic",
            display: true,
            title: {
              display: !!data.yAxis?.label,
              text: data.yAxis?.label,
              color: theme.text,
            },
            ticks: { color: theme.textSecondary },
            grid: { color: theme.border },
            min: data.yAxis?.min,
            max: data.yAxis?.max,
          },
        },
      },
    });

    // Attach annotations metadata for the custom plugin
    (chartInstance as unknown as { _timeseriesAnnotations?: TimeseriesAnnotation[] })
      ._timeseriesAnnotations = data.annotations;

    chartRef.current = chartInstance;

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
