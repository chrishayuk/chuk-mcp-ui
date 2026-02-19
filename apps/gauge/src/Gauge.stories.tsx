import type { Meta, StoryObj } from "@storybook/react";
import { GaugeRenderer } from "./App";
import type { GaugeContent } from "./schema";

const meta = {
  title: "Views/Gauge",
  component: GaugeRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof GaugeRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SpeedGauge: Story = {
  args: {
    data: {
      type: "gauge",
      version: "1.0",
      value: 72,
      min: 0,
      max: 120,
      unit: "mph",
      thresholds: [
        { value: 60, color: "#22c55e" },
        { value: 90, color: "#f59e0b" },
        { value: 120, color: "#ef4444" },
      ],
      title: "Speed",
    } satisfies GaugeContent,
  },
};

export const CPUUsage: Story = {
  args: {
    data: {
      type: "gauge",
      version: "1.0",
      value: 68,
      min: 0,
      max: 100,
      format: "percent",
      thresholds: [
        { value: 50, color: "#22c55e" },
        { value: 80, color: "#f59e0b" },
        { value: 100, color: "#ef4444" },
      ],
      title: "CPU Usage",
      subtitle: "Server Alpha",
    } satisfies GaugeContent,
  },
};

export const Temperature: Story = {
  args: {
    data: {
      type: "gauge",
      version: "1.0",
      value: 23.5,
      min: -10,
      max: 50,
      unit: "\u00B0C",
      size: "lg",
      title: "Room Temperature",
    } satisfies GaugeContent,
  },
};
