import type { Meta, StoryObj } from "@storybook/react";
import { CrosstabRenderer } from "./App";
import type { CrosstabContent } from "./schema";

const meta = {
  title: "Views/Crosstab",
  component: CrosstabRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof CrosstabRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Heatmap: Story = {
  args: {
    data: {
      type: "crosstab",
      version: "1.0",
      title: "Sales by Region and Quarter",
      rowHeaders: ["North", "South", "East", "West"],
      columnHeaders: ["Q1", "Q2", "Q3", "Q4"],
      values: [
        [120, 150, 180, 200],
        [90, 110, 95, 130],
        [200, 220, 250, 280],
        [75, 80, 110, 95],
      ],
      formatting: "heatmap",
      colorScale: { min: "#dbeafe", max: "#1e40af" },
      showTotals: true,
      annotations: [
        { row: 2, col: 3, label: "Record high", highlight: true },
        { row: 1, col: 2, label: "Below target" },
      ],
    } satisfies CrosstabContent,
  },
};

export const Bars: Story = {
  args: {
    data: {
      type: "crosstab",
      version: "1.0",
      title: "Feature Usage by Plan",
      rowHeaders: ["Free", "Pro", "Enterprise"],
      columnHeaders: ["Dashboard", "Reports", "API", "Webhooks", "SSO"],
      values: [
        [850, 320, 45, 0, 0],
        [1200, 980, 750, 420, 0],
        [500, 490, 480, 460, 450],
      ],
      formatting: "bars",
      showTotals: false,
    } satisfies CrosstabContent,
  },
};

export const Percentage: Story = {
  args: {
    data: {
      type: "crosstab",
      version: "1.0",
      title: "Survey Responses",
      rowHeaders: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
      columnHeaders: ["Question 1", "Question 2", "Question 3"],
      values: [
        [45, 30, 55],
        [25, 35, 20],
        [15, 20, 10],
        [10, 10, 10],
        [5, 5, 5],
      ],
      formatting: "percentage",
      showTotals: true,
    } satisfies CrosstabContent,
  },
};
