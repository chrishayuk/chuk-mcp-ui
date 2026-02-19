import type { Meta, StoryObj } from "@storybook/react";
import { TimeseriesRenderer } from "./App";
import type { TimeseriesContent } from "./schema";

const meta = {
  title: "Views/TimeseriesRenderer",
  component: TimeseriesRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof TimeseriesRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate 30 days of stock price data
function generateStockPrices(): { t: string; v: number }[] {
  const points: { t: string; v: number }[] = [];
  let price = 150;
  for (let i = 0; i < 30; i++) {
    const date = new Date(2025, 0, i + 1);
    price += (Math.random() - 0.48) * 5;
    points.push({
      t: date.toISOString(),
      v: Math.round(price * 100) / 100,
    });
  }
  return points;
}

export const StockPrice: Story = {
  args: {
    data: {
      type: "timeseries",
      version: "1.0",
      title: "ACME Corp Stock Price",
      subtitle: "January 2025 — Daily Close",
      series: [
        {
          label: "ACME (Close)",
          data: generateStockPrices(),
          color: "#3388ff",
        },
      ],
      xAxis: { label: "Date" },
      yAxis: { label: "Price (USD)", min: 130, max: 180 },
      zoom: true,
    } satisfies TimeseriesContent,
  },
};

export const ServerMetrics: Story = {
  args: {
    data: {
      type: "timeseries",
      version: "1.0",
      title: "Server Metrics",
      subtitle: "CPU and Memory over 24 hours",
      series: [
        {
          label: "CPU %",
          data: Array.from({ length: 24 }, (_, i) => ({
            t: new Date(2025, 0, 15, i).toISOString(),
            v: 30 + Math.sin(i / 4) * 20 + Math.random() * 10,
          })),
          color: "#ff6384",
          type: "line",
        },
        {
          label: "Memory %",
          data: Array.from({ length: 24 }, (_, i) => ({
            t: new Date(2025, 0, 15, i).toISOString(),
            v: 50 + Math.cos(i / 6) * 15 + Math.random() * 5,
          })),
          color: "#36a2eb",
          type: "line",
        },
      ],
      xAxis: { label: "Time" },
      yAxis: { label: "Usage (%)", min: 0, max: 100 },
      annotations: [
        {
          type: "line",
          start: new Date(2025, 0, 15, 8).toISOString(),
          label: "Deploy",
          color: "#ff9f40",
        },
        {
          type: "range",
          start: new Date(2025, 0, 15, 14).toISOString(),
          end: new Date(2025, 0, 15, 16).toISOString(),
          label: "Peak Traffic",
          color: "#ff6384",
        },
      ],
    } satisfies TimeseriesContent,
  },
};

export const BarTimeseries: Story = {
  args: {
    data: {
      type: "timeseries",
      version: "1.0",
      title: "Monthly Revenue",
      subtitle: "2024 Fiscal Year",
      series: [
        {
          label: "Revenue",
          data: Array.from({ length: 12 }, (_, i) => ({
            t: new Date(2024, i, 1).toISOString(),
            v: 80000 + Math.random() * 40000,
          })),
          color: "#4bc0c0",
          type: "bar",
        },
      ],
      xAxis: { label: "Month" },
      yAxis: { label: "Revenue (USD)" },
    } satisfies TimeseriesContent,
  },
};

export const AreaChart: Story = {
  args: {
    data: {
      type: "timeseries",
      version: "1.0",
      title: "Network Traffic",
      subtitle: "Bytes transferred over the past week",
      series: [
        {
          label: "Inbound",
          data: Array.from({ length: 7 }, (_, i) => ({
            t: new Date(2025, 1, i + 1).toISOString(),
            v: 500 + Math.random() * 300,
          })),
          color: "#9966ff",
          type: "area",
        },
        {
          label: "Outbound",
          data: Array.from({ length: 7 }, (_, i) => ({
            t: new Date(2025, 1, i + 1).toISOString(),
            v: 200 + Math.random() * 200,
          })),
          color: "#ffce56",
          type: "area",
        },
      ],
      xAxis: { label: "Date" },
      yAxis: { label: "MB" },
    } satisfies TimeseriesContent,
  },
};
