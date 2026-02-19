import type { Meta, StoryObj } from "@storybook/react";
import { BoxplotRenderer } from "./App";
import type { BoxplotContent } from "./schema";

const meta = {
  title: "Views/Boxplot",
  component: BoxplotRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof BoxplotRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SalaryDistribution: Story = {
  args: {
    data: {
      type: "boxplot",
      version: "1.0",
      title: "Salary Distribution by Department",
      orientation: "vertical",
      showOutliers: false,
      yAxis: { label: "Annual Salary ($K)" },
      groups: [
        {
          label: "Engineering",
          color: "#3388ff",
          stats: { min: 85, q1: 110, median: 135, q3: 160, max: 195 },
        },
        {
          label: "Marketing",
          color: "#ff6384",
          stats: { min: 55, q1: 72, median: 90, q3: 115, max: 145 },
        },
        {
          label: "Sales",
          color: "#ffce56",
          stats: { min: 48, q1: 65, median: 82, q3: 105, max: 140 },
        },
        {
          label: "HR",
          color: "#4bc0c0",
          stats: { min: 50, q1: 68, median: 80, q3: 98, max: 125 },
        },
      ],
    } satisfies BoxplotContent,
  },
};

export const HorizontalBoxplot: Story = {
  args: {
    data: {
      type: "boxplot",
      version: "1.0",
      title: "Salary Distribution by Department",
      orientation: "horizontal",
      showOutliers: false,
      yAxis: { label: "Annual Salary ($K)" },
      groups: [
        {
          label: "Engineering",
          color: "#3388ff",
          stats: { min: 85, q1: 110, median: 135, q3: 160, max: 195 },
        },
        {
          label: "Marketing",
          color: "#ff6384",
          stats: { min: 55, q1: 72, median: 90, q3: 115, max: 145 },
        },
        {
          label: "Sales",
          color: "#ffce56",
          stats: { min: 48, q1: 65, median: 82, q3: 105, max: 140 },
        },
        {
          label: "HR",
          color: "#4bc0c0",
          stats: { min: 50, q1: 68, median: 80, q3: 98, max: 125 },
        },
      ],
    } satisfies BoxplotContent,
  },
};

export const WithOutliers: Story = {
  args: {
    data: {
      type: "boxplot",
      version: "1.0",
      title: "Response Time by Service (ms)",
      orientation: "vertical",
      showOutliers: true,
      yAxis: { label: "Latency (ms)" },
      groups: [
        {
          label: "Auth",
          color: "#3388ff",
          stats: {
            min: 12,
            q1: 25,
            median: 38,
            q3: 55,
            max: 82,
            outliers: [120, 145, 210],
          },
        },
        {
          label: "API",
          color: "#ff6384",
          stats: {
            min: 45,
            q1: 80,
            median: 110,
            q3: 150,
            max: 200,
            outliers: [320, 480],
          },
        },
        {
          label: "DB",
          color: "#9966ff",
          stats: {
            min: 5,
            q1: 10,
            median: 18,
            q3: 30,
            max: 50,
            outliers: [95, 130, 175, 260],
          },
        },
      ],
    } satisfies BoxplotContent,
  },
};

export const WithMean: Story = {
  args: {
    data: {
      type: "boxplot",
      version: "1.0",
      title: "Test Scores by Class",
      orientation: "vertical",
      showOutliers: false,
      yAxis: { label: "Score", min: 0, max: 100 },
      groups: [
        {
          label: "Class A",
          color: "#36a2eb",
          stats: { min: 42, q1: 62, median: 75, q3: 85, max: 98, mean: 73.2 },
        },
        {
          label: "Class B",
          color: "#ff9f40",
          stats: { min: 35, q1: 55, median: 68, q3: 80, max: 95, mean: 66.8 },
        },
        {
          label: "Class C",
          color: "#4bc0c0",
          stats: { min: 50, q1: 65, median: 78, q3: 88, max: 100, mean: 76.5 },
        },
        {
          label: "Class D",
          color: "#ff6384",
          stats: { min: 28, q1: 48, median: 60, q3: 72, max: 90, mean: 58.4 },
        },
      ],
    } satisfies BoxplotContent,
  },
};
