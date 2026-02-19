import type { Meta, StoryObj } from "@storybook/react";
import { ScatterRenderer } from "./App";
import type { ScatterContent } from "./schema";

const meta = {
  title: "Views/Scatter",
  component: ScatterRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof ScatterRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IrisDataset: Story = {
  args: {
    data: {
      type: "scatter",
      version: "1.0",
      title: "Iris Dataset — Sepal Dimensions",
      subtitle: "Sepal length vs. sepal width by species",
      datasets: [
        {
          label: "Setosa",
          color: "#3388ff",
          pointStyle: "circle",
          points: [
            { x: 5.1, y: 3.5 },
            { x: 4.9, y: 3.0 },
            { x: 4.7, y: 3.2 },
            { x: 4.6, y: 3.1 },
            { x: 5.0, y: 3.6 },
            { x: 5.4, y: 3.9 },
            { x: 4.6, y: 3.4 },
            { x: 5.0, y: 3.4 },
            { x: 4.4, y: 2.9 },
            { x: 4.9, y: 3.1 },
          ],
        },
        {
          label: "Versicolor",
          color: "#ff6384",
          pointStyle: "triangle",
          points: [
            { x: 7.0, y: 3.2 },
            { x: 6.4, y: 3.2 },
            { x: 6.9, y: 3.1 },
            { x: 5.5, y: 2.3 },
            { x: 6.5, y: 2.8 },
            { x: 5.7, y: 2.8 },
            { x: 6.3, y: 3.3 },
            { x: 4.9, y: 2.4 },
            { x: 6.6, y: 2.9 },
            { x: 5.2, y: 2.7 },
          ],
        },
        {
          label: "Virginica",
          color: "#4bc0c0",
          pointStyle: "rect",
          points: [
            { x: 6.3, y: 3.3 },
            { x: 5.8, y: 2.7 },
            { x: 7.1, y: 3.0 },
            { x: 6.3, y: 2.9 },
            { x: 6.5, y: 3.0 },
            { x: 7.6, y: 3.0 },
            { x: 4.9, y: 2.5 },
            { x: 7.3, y: 2.9 },
            { x: 6.7, y: 2.5 },
            { x: 7.2, y: 3.6 },
          ],
        },
      ],
      xAxis: { label: "Sepal Length (cm)" },
      yAxis: { label: "Sepal Width (cm)" },
      legend: { position: "top" },
    } satisfies ScatterContent,
  },
};

export const BubblePlot: Story = {
  args: {
    data: {
      type: "scatter",
      version: "1.0",
      title: "Country GDP vs Life Expectancy",
      subtitle: "Bubble size = population (millions)",
      datasets: [
        {
          label: "Countries",
          color: "#9966ff",
          points: [
            { x: 12000, y: 74, r: 25, label: "Brazil", metadata: { region: "South America" } },
            { x: 45000, y: 79, r: 15, label: "Germany", metadata: { region: "Europe" } },
            { x: 63000, y: 78, r: 20, label: "United States", metadata: { region: "North America" } },
            { x: 10000, y: 69, r: 40, label: "India", metadata: { region: "Asia" } },
            { x: 35000, y: 84, r: 10, label: "Japan", metadata: { region: "Asia" } },
            { x: 8000, y: 73, r: 12, label: "Mexico", metadata: { region: "North America" } },
            { x: 42000, y: 82, r: 6, label: "Australia", metadata: { region: "Oceania" } },
            { x: 3000, y: 63, r: 35, label: "Nigeria", metadata: { region: "Africa" } },
          ],
        },
      ],
      xAxis: { label: "GDP per Capita (USD)" },
      yAxis: { label: "Life Expectancy (years)" },
      legend: { position: "none" },
    } satisfies ScatterContent,
  },
};

export const LogarithmicAxes: Story = {
  args: {
    data: {
      type: "scatter",
      version: "1.0",
      title: "Performance Benchmarks",
      subtitle: "Log scale — operations vs latency",
      datasets: [
        {
          label: "System A",
          color: "#ff9f40",
          pointStyle: "star",
          pointRadius: 6,
          points: [
            { x: 10, y: 1 },
            { x: 100, y: 5 },
            { x: 1000, y: 50 },
            { x: 10000, y: 500 },
            { x: 100000, y: 5000 },
          ],
        },
        {
          label: "System B",
          color: "#36a2eb",
          pointStyle: "cross",
          pointRadius: 6,
          points: [
            { x: 10, y: 2 },
            { x: 100, y: 8 },
            { x: 1000, y: 30 },
            { x: 10000, y: 200 },
            { x: 100000, y: 1500 },
          ],
        },
      ],
      xAxis: { label: "Operations", type: "logarithmic" },
      yAxis: { label: "Latency (ms)", type: "logarithmic" },
      legend: { position: "bottom" },
    } satisfies ScatterContent,
  },
};

export const SingleDataset: Story = {
  args: {
    data: {
      type: "scatter",
      version: "1.0",
      title: "Test Scores",
      datasets: [
        {
          label: "Students",
          color: "#3388ff",
          points: [
            { x: 2, y: 65, label: "Alice" },
            { x: 4, y: 72, label: "Bob" },
            { x: 6, y: 58, label: "Carol" },
            { x: 3, y: 80, label: "Dave" },
            { x: 5, y: 91, label: "Eve" },
            { x: 7, y: 45, label: "Frank" },
            { x: 1, y: 70, label: "Grace" },
            { x: 8, y: 88, label: "Heidi" },
          ],
        },
      ],
      xAxis: { label: "Hours Studied" },
      yAxis: { label: "Score (%)", min: 0, max: 100 },
    } satisfies ScatterContent,
  },
};
