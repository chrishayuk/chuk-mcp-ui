import type { Meta, StoryObj } from "@storybook/react";
import { MinimapRenderer } from "./App";
import type { MinimapContent } from "./schema";

const meta = {
  title: "Views/Minimap",
  component: MinimapRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof MinimapRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

const londonFeatures = {
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

const thamesLine = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [-0.15, 51.485],
          [-0.12, 51.502],
          [-0.08, 51.508],
          [-0.02, 51.505],
        ],
      },
      properties: { name: "Thames Path", type: "river" },
    },
  ],
};

const parkPolygon = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [-0.17, 51.507],
            [-0.15, 51.507],
            [-0.15, 51.513],
            [-0.17, 51.513],
            [-0.17, 51.507],
          ],
        ],
      },
      properties: { name: "Hyde Park", type: "park" },
    },
  ],
};

const horizontalData: MinimapContent = {
  type: "minimap",
  version: "1.0",
  title: "London Overview & Detail",
  layout: "horizontal",
  ratio: "1:2",
  linkZoom: false,
  overview: {
    center: { lat: 51.505, lon: -0.1 },
    zoom: 11,
    basemap: "osm",
    layers: [
      {
        id: "landmarks-overview",
        label: "Landmarks",
        features: londonFeatures,
        style: { color: "#dc2626", radius: 5 },
      },
      {
        id: "thames-overview",
        label: "Thames",
        features: thamesLine,
        style: { color: "#3b82f6", weight: 3 },
      },
    ],
  },
  detail: {
    center: { lat: 51.505, lon: -0.1 },
    zoom: 15,
    basemap: "osm",
    layers: [
      {
        id: "landmarks-detail",
        label: "Landmarks",
        features: londonFeatures,
        popup: { title: "Landmark", fields: ["name", "category"] },
      },
      {
        id: "thames-detail",
        label: "Thames",
        features: thamesLine,
        style: { color: "#3b82f6", weight: 4 },
      },
      {
        id: "parks-detail",
        label: "Parks",
        features: parkPolygon,
        style: { fillColor: "#22c55e", fillOpacity: 0.3, color: "#166534", weight: 2 },
      },
    ],
  },
};

export const Horizontal: Story = {
  args: { data: horizontalData },
};

export const Vertical: Story = {
  args: {
    data: {
      ...horizontalData,
      title: "London — Vertical Layout",
      layout: "vertical",
      ratio: "1:1",
    },
  },
};

export const LinkedZoom: Story = {
  args: {
    data: {
      ...horizontalData,
      title: "Linked Zoom",
      linkZoom: true,
    },
  },
};

export const SatelliteOverview: Story = {
  args: {
    data: {
      ...horizontalData,
      title: "Satellite Overview / Dark Detail",
      overview: {
        ...horizontalData.overview,
        basemap: "satellite",
      },
      detail: {
        ...horizontalData.detail,
        basemap: "dark",
      },
    },
  },
};

export const NoTitle: Story = {
  args: {
    data: {
      type: "minimap",
      version: "1.0",
      layout: "horizontal",
      ratio: "1:3",
      overview: {
        center: { lat: 51.505, lon: -0.1 },
        zoom: 10,
        layers: [
          {
            id: "points",
            label: "Points",
            features: londonFeatures,
            style: { radius: 6, color: "#6366f1" },
          },
        ],
      },
      detail: {
        center: { lat: 51.505, lon: -0.1 },
        zoom: 16,
        layers: [
          {
            id: "points-d",
            label: "Points",
            features: londonFeatures,
            popup: { title: "Location", fields: ["name"] },
          },
        ],
      },
    },
  },
};
