import type { Meta, StoryObj } from "@storybook/react";
import { LeafletMap } from "./App";
import { mockCallTool } from "../../../.storybook/mock-call-tool";
import type { MapContent } from "./schema";

const meta = {
  title: "Views/Map",
  component: LeafletMap,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof LeafletMap>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleFeatures = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [-0.1, 51.505] },
      properties: { name: "Big Ben", category: "Landmark" },
    },
    {
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [-0.076, 51.508] },
      properties: { name: "Tower of London", category: "Historical" },
    },
    {
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [-0.119, 51.503] },
      properties: { name: "London Eye", category: "Attraction" },
    },
  ],
};

const singleLayerData: MapContent = {
  type: "map",
  version: "1.0",
  center: { lat: 51.505, lon: -0.1 },
  zoom: 13,
  basemap: "osm",
  layers: [
    {
      id: "landmarks",
      label: "London Landmarks",
      features: sampleFeatures,
      popup: {
        title: "{properties.name}",
        fields: ["category"],
      },
    },
  ],
};

export const SingleLayer: Story = {
  args: {
    data: singleLayerData,
    app: null,
    onCallTool: mockCallTool,
  },
};

export const Clustered: Story = {
  args: {
    data: {
      ...singleLayerData,
      layers: [
        {
          ...singleLayerData.layers[0],
          cluster: { enabled: true, radius: 50 },
        },
      ],
    },
    app: null,
    onCallTool: mockCallTool,
  },
};
