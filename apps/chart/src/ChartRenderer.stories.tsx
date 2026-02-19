import type { Meta, StoryObj } from "@storybook/react";
import { ChartRenderer } from "./App";
import type { ChartContent } from "./schema";

const meta = {
  title: "Views/Chart",
  component: ChartRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof ChartRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bar: Story = {
  args: {
    data: {
      type: "chart",
      version: "1.0",
      title: "Sales by Region",
      chartType: "bar",
      data: [
        {
          label: "Q1",
          values: [
            { label: "North", value: 120 },
            { label: "South", value: 98 },
            { label: "East", value: 150 },
            { label: "West", value: 87 },
          ],
          color: "#3388ff",
        },
        {
          label: "Q2",
          values: [
            { label: "North", value: 140 },
            { label: "South", value: 110 },
            { label: "East", value: 165 },
            { label: "West", value: 95 },
          ],
          color: "#ff6384",
        },
        {
          label: "Q3",
          values: [
            { label: "North", value: 155 },
            { label: "South", value: 125 },
            { label: "East", value: 180 },
            { label: "West", value: 112 },
          ],
          color: "#ffce56",
        },
      ],
      xAxis: { label: "Region" },
      yAxis: { label: "Sales ($K)" },
    } satisfies ChartContent,
  },
};

export const Line: Story = {
  args: {
    data: {
      type: "chart",
      version: "1.0",
      title: "Temperature Over Time",
      chartType: "line",
      data: [
        {
          label: "Sensor A",
          values: [
            { x: 0, y: 20 },
            { x: 1, y: 22 },
            { x: 2, y: 19 },
            { x: 3, y: 25 },
            { x: 4, y: 27 },
            { x: 5, y: 23 },
            { x: 6, y: 28 },
          ],
          color: "#3388ff",
        },
        {
          label: "Sensor B",
          values: [
            { x: 0, y: 18 },
            { x: 1, y: 20 },
            { x: 2, y: 17 },
            { x: 3, y: 21 },
            { x: 4, y: 24 },
            { x: 5, y: 22 },
            { x: 6, y: 26 },
          ],
          color: "#ff6384",
        },
      ],
      xAxis: { label: "Hour" },
      yAxis: { label: "Temperature (C)" },
    } satisfies ChartContent,
  },
};

export const Pie: Story = {
  args: {
    data: {
      type: "chart",
      version: "1.0",
      title: "Market Share",
      chartType: "pie",
      data: [
        {
          label: "Market Share",
          values: [
            { label: "Product A", value: 35 },
            { label: "Product B", value: 25 },
            { label: "Product C", value: 20 },
            { label: "Product D", value: 12 },
            { label: "Product E", value: 8 },
          ],
        },
      ],
    } satisfies ChartContent,
  },
};

export const Scatter: Story = {
  args: {
    data: {
      type: "chart",
      version: "1.0",
      title: "Height vs Weight",
      chartType: "scatter",
      data: [
        {
          label: "Measurements",
          values: [
            { x: 160, y: 55 },
            { x: 165, y: 62 },
            { x: 170, y: 68 },
            { x: 172, y: 70 },
            { x: 175, y: 74 },
            { x: 178, y: 78 },
            { x: 180, y: 82 },
            { x: 183, y: 80 },
            { x: 185, y: 88 },
            { x: 190, y: 92 },
            { x: 168, y: 60 },
            { x: 174, y: 72 },
          ],
          color: "#9966ff",
        },
      ],
      xAxis: { label: "Height (cm)" },
      yAxis: { label: "Weight (kg)" },
    } satisfies ChartContent,
  },
};

export const Area: Story = {
  args: {
    data: {
      type: "chart",
      version: "1.0",
      title: "Revenue Trend",
      chartType: "area",
      data: [
        {
          label: "Monthly Revenue",
          values: [
            { label: "Jan", value: 30 },
            { label: "Feb", value: 45 },
            { label: "Mar", value: 42 },
            { label: "Apr", value: 55 },
            { label: "May", value: 60 },
            { label: "Jun", value: 72 },
            { label: "Jul", value: 68 },
            { label: "Aug", value: 80 },
            { label: "Sep", value: 78 },
            { label: "Oct", value: 90 },
            { label: "Nov", value: 95 },
            { label: "Dec", value: 110 },
          ],
          color: "#4bc0c0",
        },
      ],
      xAxis: { label: "Month" },
      yAxis: { label: "Revenue ($K)" },
    } satisfies ChartContent,
  },
};

export const Radar: Story = {
  args: {
    data: {
      type: "chart",
      version: "1.0",
      title: "Skill Assessment",
      chartType: "radar",
      data: [
        {
          label: "Developer Profile",
          values: [
            { label: "JavaScript", value: 90 },
            { label: "TypeScript", value: 85 },
            { label: "React", value: 88 },
            { label: "Node.js", value: 75 },
            { label: "CSS", value: 70 },
            { label: "Testing", value: 65 },
          ],
          color: "#36a2eb",
        },
      ],
    } satisfies ChartContent,
  },
};
