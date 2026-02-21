import type { Meta, StoryObj } from "@storybook/react";
import { ThreedRenderer } from "./App";
import type { ThreedContent } from "./schema";

const meta = {
  title: "Views/Threed",
  component: ThreedRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof ThreedRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicShapes: Story = {
  args: {
    data: {
      type: "threed",
      version: "1.0",
      title: "All Geometry Types",
      objects: [
        { id: "box", geometry: "box", position: [-3, 0, 0], color: "#3b82f6", label: "Box" },
        { id: "sphere", geometry: "sphere", position: [0, 0, -2], color: "#22c55e", label: "Sphere" },
        { id: "cylinder", geometry: "cylinder", position: [3, 0, 0], color: "#f59e0b", label: "Cylinder" },
        { id: "cone", geometry: "cone", position: [-1.5, 0, 3], color: "#ef4444", label: "Cone" },
        { id: "torus", geometry: "torus", position: [2, 0, 3], color: "#8b5cf6", label: "Torus" },
      ],
    } satisfies ThreedContent,
  },
};

export const MolecularModel: Story = {
  args: {
    data: {
      type: "threed",
      version: "1.0",
      title: "Water Molecule (H2O)",
      background: "#0f172a",
      objects: [
        {
          id: "oxygen",
          geometry: "sphere",
          position: [0, 0, 0],
          scale: [1.2, 1.2, 1.2],
          color: "#ef4444",
          label: "O",
        },
        {
          id: "hydrogen1",
          geometry: "sphere",
          position: [-2, 1, 0],
          scale: [0.7, 0.7, 0.7],
          color: "#60a5fa",
          label: "H",
        },
        {
          id: "hydrogen2",
          geometry: "sphere",
          position: [2, 1, 0],
          scale: [0.7, 0.7, 0.7],
          color: "#60a5fa",
          label: "H",
        },
        {
          id: "bond1",
          geometry: "cylinder",
          position: [-1, 0.5, 0],
          scale: [0.15, 0.6, 0.15],
          color: "#94a3b8",
        },
        {
          id: "bond2",
          geometry: "cylinder",
          position: [1, 0.5, 0],
          scale: [0.15, 0.6, 0.15],
          color: "#94a3b8",
        },
      ],
    } satisfies ThreedContent,
  },
};

export const ArchitecturalBlocks: Story = {
  args: {
    data: {
      type: "threed",
      version: "1.0",
      title: "Simple Building",
      objects: [
        {
          id: "base",
          geometry: "box",
          position: [0, 0, 0],
          scale: [3, 1.5, 2],
          color: "#94a3b8",
          label: "Foundation",
        },
        {
          id: "floor1",
          geometry: "box",
          position: [0, 2.5, 0],
          scale: [2.8, 1, 1.8],
          color: "#64748b",
        },
        {
          id: "floor2",
          geometry: "box",
          position: [0, 4.5, 0],
          scale: [2.5, 1, 1.5],
          color: "#475569",
        },
        {
          id: "pillar1",
          geometry: "cylinder",
          position: [-2, 0, -1.5],
          scale: [0.3, 1.5, 0.3],
          color: "#d4a373",
        },
        {
          id: "pillar2",
          geometry: "cylinder",
          position: [2, 0, -1.5],
          scale: [0.3, 1.5, 0.3],
          color: "#d4a373",
        },
        {
          id: "dome",
          geometry: "sphere",
          position: [0, 6, 0],
          scale: [1.2, 0.8, 1.2],
          color: "#fbbf24",
          label: "Dome",
        },
      ],
    } satisfies ThreedContent,
  },
};
