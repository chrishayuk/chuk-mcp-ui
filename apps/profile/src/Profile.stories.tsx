import type { Meta, StoryObj } from "@storybook/react";
import { ProfileRenderer } from "./App";
import type { ProfileContent } from "./schema";

const meta = {
  title: "Views/ProfileRenderer",
  component: ProfileRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof ProfileRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MountainPass: Story = {
  args: {
    data: {
      type: "profile",
      version: "1.0",
      title: "Mountain Pass Elevation Profile",
      points: [
        { x: 0, y: 1200 },
        { x: 2, y: 1350 },
        { x: 4, y: 1580 },
        { x: 6, y: 1820 },
        { x: 8, y: 2100 },
        { x: 10, y: 2350 },
        { x: 12, y: 2500 },
        { x: 14, y: 2420 },
        { x: 16, y: 2200 },
        { x: 18, y: 1950 },
        { x: 20, y: 1700 },
        { x: 22, y: 1500 },
        { x: 24, y: 1350 },
      ],
      xLabel: "Distance (km)",
      yLabel: "Elevation (m)",
      fill: true,
      color: "#4bc0c0",
      markers: [
        { x: 12, label: "Summit", color: "#ff6384" },
        { x: 5, label: "Rest Stop" },
        { x: 20, label: "Campsite", color: "#36a2eb" },
      ],
    } satisfies ProfileContent,
  },
};

export const RiverCrossSection: Story = {
  args: {
    data: {
      type: "profile",
      version: "1.0",
      title: "River Cross-Section",
      points: [
        { x: 0, y: 5 },
        { x: 2, y: 4.5 },
        { x: 4, y: 3 },
        { x: 6, y: 1.5 },
        { x: 8, y: 0.5 },
        { x: 10, y: 0 },
        { x: 12, y: 0.2 },
        { x: 14, y: 1 },
        { x: 16, y: 2.5 },
        { x: 18, y: 4 },
        { x: 20, y: 5 },
      ],
      xLabel: "Width (m)",
      yLabel: "Depth (m)",
      fill: true,
      color: "#3388ff",
      markers: [
        { x: 10, label: "Deepest Point", color: "#ff6384" },
      ],
    } satisfies ProfileContent,
  },
};

export const MinimalProfile: Story = {
  args: {
    data: {
      type: "profile",
      version: "1.0",
      points: [
        { x: 0, y: 10 },
        { x: 5, y: 25 },
        { x: 10, y: 18 },
        { x: 15, y: 32 },
        { x: 20, y: 28 },
      ],
    } satisfies ProfileContent,
  },
};

export const GeologicalStratum: Story = {
  args: {
    data: {
      type: "profile",
      version: "1.0",
      title: "Geological Stratum Section",
      points: [
        { x: 0, y: -50 },
        { x: 10, y: -45 },
        { x: 20, y: -60 },
        { x: 30, y: -55 },
        { x: 40, y: -70 },
        { x: 50, y: -80 },
        { x: 60, y: -75 },
        { x: 70, y: -65 },
        { x: 80, y: -50 },
        { x: 90, y: -40 },
        { x: 100, y: -35 },
      ],
      xLabel: "Horizontal Distance (m)",
      yLabel: "Depth (m)",
      fill: true,
      color: "#9966ff",
      markers: [
        { x: 25, label: "Borehole A", color: "#ff9f40" },
        { x: 50, label: "Fault Line", color: "#ff6384" },
        { x: 75, label: "Borehole B", color: "#ff9f40" },
      ],
    } satisfies ProfileContent,
  },
};
