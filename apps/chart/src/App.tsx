import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  TimeScale,
  BarController,
  LineController,
  ScatterController,
  PieController,
  DoughnutController,
  RadarController,
  BubbleController,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Legend,
  Title,
  Tooltip,
} from "chart.js";
import { useView, Fallback } from "@chuk/view-shared";
import type { ChartContent, ChartDataset, DataPoint } from "./schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  TimeScale,
  BarController,
  LineController,
  ScatterController,
  PieController,
  DoughnutController,
  RadarController,
  BubbleController,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
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

export function ChartView() {
  const { data, content, isConnected } =
    useView<ChartContent>("chart", "1.0");

  if (!isConnected) return <Fallback message="Connecting..." />;
  if (!data) return <Fallback content={content ?? undefined} />;

  return <ChartRenderer data={data} />;
}

export function ChartRenderer({ data }: { data: ChartContent }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const isPie = data.chartType === "pie" || data.chartType === "doughnut";
    const isRadar = data.chartType === "radar";
    const chartType = data.chartType === "area" ? "line" : data.chartType;
    const theme = getThemeColors();

    const labels = extractLabels(data.data);

    const datasets = data.data.map((ds, i) => {
      const color = ds.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      const bg = ds.backgroundColor ?? (isPie ? DEFAULT_COLORS : color);
      const values = normalizeValues(ds.values, isPie || isRadar);

      return {
        label: ds.label,
        data: values,
        backgroundColor:
          isPie && Array.isArray(bg)
            ? bg
            : data.chartType === "area" || ds.fill
              ? withAlpha(typeof bg === "string" ? bg : color, 0.2)
              : bg,
        borderColor: isPie ? theme.text : color,
        borderWidth: ds.borderWidth ?? (isPie ? 2 : 2),
        fill: data.chartType === "area" || ds.fill || false,
        tension: ds.tension ?? (data.chartType === "area" ? 0.4 : 0),
        type: ds.type === "area" ? "line" as const : ds.type as string | undefined,
        pointRadius: data.chartType === "scatter" || data.chartType === "bubble" ? 4 : 3,
      };
    });

    chartRef.current = new ChartJS(canvasRef.current, {
      type: chartType as any,
      data: {
        labels: isPie || isRadar || labels.length > 0 ? labels : undefined,
        datasets: datasets as never,
      },
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
            display: data.legend?.position !== "none",
            position: data.legend?.position ?? "top",
            labels: { color: theme.text },
          },
          tooltip: {
            enabled: data.interactive !== false,
          },
        },
        scales: isPie || isRadar
          ? undefined
          : {
              x: {
                display: true,
                title: {
                  display: !!data.xAxis?.label,
                  text: data.xAxis?.label,
                  color: theme.text,
                },
                ticks: { color: theme.textSecondary },
                grid: { color: theme.border },
                type: (data.xAxis?.type ?? "category") as never,
                min: data.xAxis?.min,
                max: data.xAxis?.max,
                stacked: data.xAxis?.stacked,
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
                stacked: data.yAxis?.stacked,
              },
            },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <div className="w-full h-full p-4 font-sans bg-background flex items-center justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
}

function extractLabels(datasets: ChartDataset[]): string[] {
  const firstDs = datasets[0];
  if (!firstDs?.values.length) return [];

  const first = firstDs.values[0];
  if (typeof first === "number") return [];
  if (typeof first === "object" && first !== null) {
    if ("label" in first) {
      return firstDs.values.map((v) =>
        typeof v === "object" && v !== null && "label" in v
          ? (v as { label: string }).label
          : ""
      );
    }
    if ("x" in first && typeof first.x === "string") {
      return firstDs.values.map((v) =>
        typeof v === "object" && v !== null && "x" in v
          ? String((v as { x: string | number }).x)
          : ""
      );
    }
  }
  return [];
}

function normalizeValues(
  values: DataPoint[],
  extractNumbers: boolean
): (number | { x: number | string; y: number; r?: number })[] {
  return values.map((v) => {
    if (typeof v === "number") return v;
    if (typeof v === "object" && v !== null) {
      if ("value" in v) return extractNumbers ? v.value : v.value;
      if ("x" in v && "y" in v) {
        if ("r" in v) return { x: v.x as number, y: v.y, r: (v as { r: number }).r };
        return extractNumbers ? v.y : { x: v.x, y: v.y };
      }
    }
    return 0;
  });
}

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
