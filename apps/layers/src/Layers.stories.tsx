import type { Meta, StoryObj } from "@storybook/react";
import { LayersRenderer } from "./App";
import type { LayersContent } from "./schema";

const meta = {
  title: "Views/Layers",
  component: LayersRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof LayersRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Sample GeoJSON data                                                */
/* ------------------------------------------------------------------ */

const roadFeatures = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [-0.14, 51.51],
          [-0.12, 51.515],
          [-0.1, 51.512],
        ],
      },
      properties: { name: "Oxford Street", type: "A Road", lanes: 4 },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [-0.13, 51.505],
          [-0.11, 51.508],
          [-0.09, 51.506],
        ],
      },
      properties: { name: "The Strand", type: "A Road", lanes: 3 },
    },
  ],
};

const buildingFeatures = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-0.1246, 51.5007],
          [-0.1240, 51.5007],
          [-0.1240, 51.5012],
          [-0.1246, 51.5012],
          [-0.1246, 51.5007],
        ]],
      },
      properties: { name: "Parliament", use: "Government", floors: 5 },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-0.0760, 51.5080],
          [-0.0740, 51.5080],
          [-0.0740, 51.5095],
          [-0.0760, 51.5095],
          [-0.0760, 51.5080],
        ]],
      },
      properties: { name: "Tower of London", use: "Historical", floors: 3 },
    },
  ],
};

const parkFeatures = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-0.17, 51.505],
          [-0.15, 51.505],
          [-0.15, 51.515],
          [-0.17, 51.515],
          [-0.17, 51.505],
        ]],
      },
      properties: { name: "Hyde Park", area_ha: 142 },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [-0.145, 51.500],
          [-0.135, 51.500],
          [-0.135, 51.505],
          [-0.145, 51.505],
          [-0.145, 51.500],
        ]],
      },
      properties: { name: "Green Park", area_ha: 19 },
    },
  ],
};

const pointFeatures = {
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

/* ------------------------------------------------------------------ */
/*  Stories                                                            */
/* ------------------------------------------------------------------ */

const cityInfraData: LayersContent = {
  type: "layers",
  version: "1.0",
  title: "London Infrastructure",
  center: { lat: 51.505, lon: -0.12 },
  zoom: 13,
  basemap: "osm",
  layers: [
    {
      id: "roads",
      label: "Roads",
      group: "Transport",
      features: roadFeatures,
      style: { color: "#e67e22", weight: 4, fillOpacity: 0.6 },
      popup: { title: "{properties.name}", fields: ["type", "lanes"] },
    },
    {
      id: "buildings",
      label: "Key Buildings",
      group: "Structures",
      features: buildingFeatures,
      style: { color: "#2c3e50", fillColor: "#95a5a6", weight: 2, fillOpacity: 0.5 },
      popup: { title: "{properties.name}", fields: ["use", "floors"] },
    },
    {
      id: "parks",
      label: "Parks",
      group: "Green Space",
      features: parkFeatures,
      style: { color: "#27ae60", fillColor: "#2ecc71", weight: 2, fillOpacity: 0.4 },
      popup: { title: "{properties.name}", fields: ["area_ha"] },
    },
  ],
};

export const CityInfrastructure: Story = {
  args: { data: cityInfraData },
};

const simpleMapData: LayersContent = {
  type: "layers",
  version: "1.0",
  title: "London Landmarks",
  center: { lat: 51.505, lon: -0.1 },
  zoom: 13,
  layers: [
    {
      id: "landmarks",
      label: "Landmarks",
      features: pointFeatures,
      popup: { title: "{properties.name}", fields: ["category"] },
    },
  ],
};

export const SimpleMap: Story = {
  args: { data: simpleMapData },
};

const styledLayersData: LayersContent = {
  type: "layers",
  version: "1.0",
  title: "Styled Layers",
  center: { lat: 51.505, lon: -0.12 },
  zoom: 13,
  basemap: "dark",
  layers: [
    {
      id: "roads",
      label: "Roads (orange)",
      features: roadFeatures,
      style: { color: "#f39c12", weight: 5, fillOpacity: 0.8 },
    },
    {
      id: "parks",
      label: "Parks (green)",
      features: parkFeatures,
      style: { color: "#1abc9c", fillColor: "#2ecc71", weight: 1, fillOpacity: 0.6 },
    },
    {
      id: "buildings",
      label: "Buildings (blue)",
      features: buildingFeatures,
      style: { color: "#2980b9", fillColor: "#3498db", weight: 2, fillOpacity: 0.5 },
    },
  ],
};

export const StyledLayers: Story = {
  args: { data: styledLayersData },
};

const multiGroupData: LayersContent = {
  type: "layers",
  version: "1.0",
  title: "Grouped Layers",
  center: { lat: 51.505, lon: -0.12 },
  zoom: 13,
  layers: [
    {
      id: "roads",
      label: "Roads",
      group: "Transport",
      features: roadFeatures,
      style: { color: "#e67e22", weight: 4, fillOpacity: 0.6 },
    },
    {
      id: "landmarks",
      label: "Landmarks",
      group: "Points of Interest",
      features: pointFeatures,
      style: { color: "#e74c3c", fillColor: "#e74c3c", fillOpacity: 0.8 },
    },
    {
      id: "parks",
      label: "Parks",
      group: "Green Space",
      features: parkFeatures,
      style: { color: "#27ae60", fillColor: "#2ecc71", weight: 2, fillOpacity: 0.4 },
    },
    {
      id: "buildings",
      label: "Buildings",
      group: "Points of Interest",
      features: buildingFeatures,
      style: { color: "#2c3e50", fillColor: "#95a5a6", weight: 2, fillOpacity: 0.5 },
    },
  ],
};

export const MultipleGroups: Story = {
  args: { data: multiGroupData },
};
