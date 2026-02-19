import type { Meta, StoryObj } from "@storybook/react";
import { HeatmapRenderer } from "./App";
import type { HeatmapContent } from "./schema";

const meta = {
  title: "Views/Heatmap",
  component: HeatmapRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof HeatmapRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  TemperatureGrid: 7 days x 24 hours                               */
/* ------------------------------------------------------------------ */

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

function generateTemperatures(): number[][] {
  return days.map((_, di) =>
    hours.map((_, hi) => {
      const base = 15 + Math.sin((hi - 6) * (Math.PI / 12)) * 12;
      const dayOffset = di < 5 ? 0 : 2;
      return Math.round((base + dayOffset) * 10) / 10;
    }),
  );
}

export const TemperatureGrid: Story = {
  args: {
    data: {
      type: "heatmap",
      version: "1.0",
      title: "Hourly Temperature (\u00B0C) — Weekly",
      rows: days,
      columns: hours,
      values: generateTemperatures(),
      colorScale: "sequential",
      minColor: "#dbeafe",
      maxColor: "#dc2626",
      showValues: false,
    } satisfies HeatmapContent,
  },
};

/* ------------------------------------------------------------------ */
/*  ConfusionMatrix: ML classification results (diverging)            */
/* ------------------------------------------------------------------ */

const classes = ["Cat", "Dog", "Bird", "Fish"];

export const ConfusionMatrix: Story = {
  args: {
    data: {
      type: "heatmap",
      version: "1.0",
      title: "Confusion Matrix — Image Classifier",
      rows: classes,
      columns: classes,
      values: [
        [85, 10, 3, 2],
        [8, 78, 7, 7],
        [4, 6, 82, 8],
        [1, 5, 9, 85],
      ],
      colorScale: "diverging",
      minColor: "#3b82f6",
      midColor: "#f8fafc",
      maxColor: "#ef4444",
      showValues: true,
    } satisfies HeatmapContent,
  },
};

/* ------------------------------------------------------------------ */
/*  ActivityHeatmap: GitHub-style contribution grid                   */
/* ------------------------------------------------------------------ */

const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateActivity(): number[][] {
  return weekdays.map(() =>
    weeks.map(() => Math.floor(Math.random() * 15)),
  );
}

export const ActivityHeatmap: Story = {
  args: {
    data: {
      type: "heatmap",
      version: "1.0",
      title: "Contribution Activity (past 12 weeks)",
      rows: weekdays,
      columns: weeks,
      values: generateActivity(),
      colorScale: "sequential",
      minColor: "#f0fdf4",
      maxColor: "#15803d",
      showValues: false,
    } satisfies HeatmapContent,
  },
};

/* ------------------------------------------------------------------ */
/*  WithAnnotations: Annotated cells highlight notable values         */
/* ------------------------------------------------------------------ */

export const WithAnnotations: Story = {
  args: {
    data: {
      type: "heatmap",
      version: "1.0",
      title: "Server Response Time (ms) by Region",
      rows: ["US-East", "US-West", "EU-West", "AP-South"],
      columns: ["GET /api", "POST /api", "GET /health", "GET /ws"],
      values: [
        [42, 120, 8, 35],
        [55, 145, 12, 40],
        [110, 230, 22, 95],
        [180, 340, 45, 150],
      ],
      colorScale: "sequential",
      minColor: "#ecfdf5",
      maxColor: "#991b1b",
      showValues: true,
      annotations: [
        { row: 3, col: 1, label: "SLA breach" },
        { row: 0, col: 2, label: "fastest" },
        { row: 3, col: 3, label: "investigate" },
      ],
    } satisfies HeatmapContent,
  },
};
