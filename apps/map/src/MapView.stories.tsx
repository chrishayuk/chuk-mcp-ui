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

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

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

// Colchester, Essex — bbox used in STAC demo
const COLCHESTER_BBOX = {
  west: 0.85, south: 51.85, east: 0.95, north: 51.93,
};
const colchesterFootprint = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [[
          [COLCHESTER_BBOX.west, COLCHESTER_BBOX.south],
          [COLCHESTER_BBOX.east, COLCHESTER_BBOX.south],
          [COLCHESTER_BBOX.east, COLCHESTER_BBOX.north],
          [COLCHESTER_BBOX.west, COLCHESTER_BBOX.north],
          [COLCHESTER_BBOX.west, COLCHESTER_BBOX.south],
        ]],
      },
      properties: { scene_id: "S2B_30UYC_20241126_0_L2A", datetime: "2024-11-26", cloud_cover_pct: 0.1 },
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

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Three London landmarks on an OSM basemap with click-to-popup. */
export const SingleLayer: Story = {
  args: {
    data: singleLayerData,
    app: null,
    onCallTool: mockCallTool,
  },
};

/** Same landmarks with marker clustering enabled. */
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

/**
 * Image overlay layer (layer_type: "image").
 *
 * A Sentinel-2 L2A thumbnail stretched over its scene bounding box on a
 * satellite basemap. The footprint polygon layer shows the bbox outline;
 * the image overlay renders the actual thumbnail. Toggle either layer in
 * the layer control.
 */
export const ImageOverlay: Story = {
  args: {
    data: {
      type: "map",
      version: "1.0",
      center: { lat: (COLCHESTER_BBOX.south + COLCHESTER_BBOX.north) / 2, lon: (COLCHESTER_BBOX.west + COLCHESTER_BBOX.east) / 2 },
      zoom: 10,
      basemap: "satellite",
      layers: [
        {
          id: "footprint",
          label: "Scene Footprint",
          layer_type: "geojson",
          features: colchesterFootprint,
          style: { color: "#1565c0", fillColor: "#42a5f5", fillOpacity: 0.15, weight: 2 },
          popup: {
            title: "{properties.scene_id}",
            fields: ["datetime", "cloud_cover_pct"],
          },
        },
        {
          id: "thumb_s2b_nov",
          label: "2024-11-26 thumbnail",
          layer_type: "image",
          image_url: "https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/30/U/YC/2024/11/S2B_30UYC_20241126_0_L2A/thumbnail.jpg",
          image_bounds: [[COLCHESTER_BBOX.south, COLCHESTER_BBOX.west], [COLCHESTER_BBOX.north, COLCHESTER_BBOX.east]],
          opacity: 0.9,
        },
      ],
      controls: { zoom: true, layers: true, scale: true },
    } satisfies MapContent,
    app: null,
    onCallTool: mockCallTool,
  },
};

/**
 * Tile layer (layer_type: "tiles").
 *
 * An XYZ tile layer rendered as a toggleable overlay on top of the OSM
 * basemap. Demonstrates adding a custom tile source — here USGS National
 * Map Topo tiles — alongside a GeoJSON marker layer.
 */
export const TileLayer: Story = {
  args: {
    data: {
      type: "map",
      version: "1.0",
      center: { lat: 40.712, lon: -74.006 },
      zoom: 11,
      basemap: "osm",
      layers: [
        {
          id: "markers",
          label: "Points of Interest",
          layer_type: "geojson",
          features: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: [-74.006, 40.712] },
                properties: { name: "Downtown Manhattan" },
              },
            ],
          },
          popup: { title: "{properties.name}", fields: [] },
        },
        {
          id: "usgs_topo",
          label: "USGS Topo Overlay",
          layer_type: "tiles",
          tile_url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
          tile_attribution: "USGS The National Map",
          tile_max_zoom: 16,
          opacity: 0.6,
          visible: false,
        },
      ],
      controls: { zoom: true, layers: true, scale: true },
    } satisfies MapContent,
    app: null,
    onCallTool: mockCallTool,
  },
};

// ---------------------------------------------------------------------------
// Panel mode fixtures (ported from layers view)
// ---------------------------------------------------------------------------

const roadFeatures = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [[-0.14, 51.51], [-0.12, 51.515], [-0.1, 51.512]],
      },
      properties: { name: "Oxford Street", type: "A Road", lanes: 4 },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: [[-0.13, 51.505], [-0.11, 51.508], [-0.09, 51.506]],
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
        coordinates: [[[-0.1246, 51.5007], [-0.1240, 51.5007], [-0.1240, 51.5012], [-0.1246, 51.5012], [-0.1246, 51.5007]]],
      },
      properties: { name: "Parliament", use: "Government", floors: 5 },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [[[-0.0760, 51.5080], [-0.0740, 51.5080], [-0.0740, 51.5095], [-0.0760, 51.5095], [-0.0760, 51.5080]]],
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
        coordinates: [[[-0.17, 51.505], [-0.15, 51.505], [-0.15, 51.515], [-0.17, 51.515], [-0.17, 51.505]]],
      },
      properties: { name: "Hyde Park", area_ha: 142 },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [[[-0.145, 51.500], [-0.135, 51.500], [-0.135, 51.505], [-0.145, 51.505], [-0.145, 51.500]]],
      },
      properties: { name: "Green Park", area_ha: 19 },
    },
  ],
};

// ---------------------------------------------------------------------------
// Panel mode stories
// ---------------------------------------------------------------------------

/** Panel layer control with grouped layers, opacity sliders, and popups. */
export const PanelLayerControl: Story = {
  args: {
    data: {
      type: "map",
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
      controls: { layers: "panel" },
    } satisfies MapContent,
    app: null,
    onCallTool: mockCallTool,
  },
};

/** Panel control on a dark basemap with no grouping. */
export const PanelNoGroups: Story = {
  args: {
    data: {
      type: "map",
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
      controls: { layers: "panel" },
    } satisfies MapContent,
    app: null,
    onCallTool: mockCallTool,
  },
};

/**
 * Mixed layers (GeoJSON footprints + image overlays).
 *
 * Mirrors the output of stac_map: one GeoJSON layer groups all scene
 * footprints, individual image overlay layers (hidden by default) let
 * the user toggle on each scene's actual satellite thumbnail.
 */
export const MixedLayers: Story = {
  args: {
    data: {
      type: "map",
      version: "1.0",
      center: { lat: 51.89, lon: 0.90 },
      zoom: 9,
      basemap: "satellite",
      layers: [
        {
          id: "scenes_sentinel_2_l2a",
          label: "Sentinel-2 L2A (2)",
          layer_type: "geojson",
          features: colchesterFootprint,
          style: { color: "#1565c0", fillColor: "#42a5f5", fillOpacity: 0.3, weight: 2 },
          cluster: { enabled: false },
          popup: {
            title: "{properties.scene_id}",
            fields: ["datetime", "cloud_cover_pct"],
          },
        },
        {
          id: "thumb_nov26",
          label: "2024-11-26",
          layer_type: "image",
          image_url: "https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/30/U/YC/2024/11/S2B_30UYC_20241126_0_L2A/thumbnail.jpg",
          image_bounds: [[COLCHESTER_BBOX.south, COLCHESTER_BBOX.west], [COLCHESTER_BBOX.north, COLCHESTER_BBOX.east]],
          opacity: 0.9,
          visible: false,
        },
      ],
      controls: { zoom: true, layers: true, scale: true },
    } satisfies MapContent,
    app: null,
    onCallTool: mockCallTool,
  },
};
