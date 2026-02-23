import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler,
  Legend,
  Title,
  Tooltip,
} from "chart.js";
import { useView } from "@chuk/view-shared";
import { Card } from "@chuk/view-ui";
import { motion } from "framer-motion";
import { fadeIn } from "@chuk/view-ui/animations";
import type { ProfileContent, ProfileMarker } from "./schema";

ChartJS.register(
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler,
  Legend,
  Title,
  Tooltip
);

const DEFAULT_COLOR = "#3388ff";

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getThemeColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    text: s.getPropertyValue("--chuk-color-text").trim() || "#1a1a1a",
    textSecondary: s.getPropertyValue("--chuk-color-text-secondary").trim() || "#666666",
    border: s.getPropertyValue("--chuk-color-border").trim() || "#e0e0e0",
  };
}

export function ProfileView() {
  const { data } =
    useView<ProfileContent>("profile", "1.0");

  if (!data) return null;

  return <ProfileRenderer data={data} />;
}

export interface ProfileRendererProps {
  data: ProfileContent;
}

export function ProfileRenderer({ data }: ProfileRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const lineColor = data.color ?? DEFAULT_COLOR;
  const shouldFill = data.fill !== false;

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const theme = getThemeColors();
    const sortedPoints = [...data.points].sort((a, b) => a.x - b.x);

    const markerAnnotations = buildMarkerPlugin(data.markers ?? [], theme);

    chartRef.current = new ChartJS(canvasRef.current, {
      type: "line",
      data: {
        datasets: [
          {
            label: data.title ?? "Elevation",
            data: sortedPoints.map((p) => ({ x: p.x, y: p.y })),
            borderColor: lineColor,
            backgroundColor: shouldFill ? withAlpha(lineColor, 0.2) : "transparent",
            fill: shouldFill ? "origin" : false,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.2,
          },
        ],
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
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label(ctx) {
                const xVal = ctx.parsed.x;
                const yVal = ctx.parsed.y;
                const xLbl = data.xLabel ?? "x";
                const yLbl = data.yLabel ?? "y";
                return `${xLbl}: ${xVal}, ${yLbl}: ${yVal}`;
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            display: true,
            title: {
              display: !!data.xLabel,
              text: data.xLabel,
              color: theme.text,
            },
            ticks: { color: theme.textSecondary },
            grid: { color: theme.border },
          },
          y: {
            type: "linear",
            display: true,
            title: {
              display: !!data.yLabel,
              text: data.yLabel,
              color: theme.text,
            },
            ticks: { color: theme.textSecondary },
            grid: { color: theme.border },
          },
        },
      },
      plugins: [markerAnnotations],
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, lineColor, shouldFill]);

  return (
    <div className="h-full overflow-auto font-sans text-foreground bg-background">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="max-w-[800px] mx-auto p-6"
      >
        <Card>
          <div className="p-4">
            <div className="relative w-full" style={{ height: 400 }}>
              <canvas ref={canvasRef} />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function buildMarkerPlugin(
  markers: ProfileMarker[],
  theme: { text: string; textSecondary: string },
) {
  return {
    id: "profileMarkers",
    afterDraw(chart: ChartJS) {
      if (!markers.length) return;
      const ctx = chart.ctx;
      const xScale = chart.scales["x"];
      const yScale = chart.scales["y"];
      if (!xScale || !yScale) return;

      for (const marker of markers) {
        const xPixel = xScale.getPixelForValue(marker.x);
        const yTop = yScale.top;
        const yBottom = yScale.bottom;

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = marker.color ?? theme.textSecondary;
        ctx.lineWidth = 1.5;
        ctx.moveTo(xPixel, yTop);
        ctx.lineTo(xPixel, yBottom);
        ctx.stroke();
        ctx.closePath();

        ctx.setLineDash([]);
        ctx.fillStyle = marker.color ?? theme.text;
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(marker.label, xPixel, yTop - 6);

        if (marker.icon) {
          ctx.font = "14px sans-serif";
          ctx.fillText(marker.icon, xPixel, yTop - 20);
        }

        ctx.restore();
      }
    },
  };
}
