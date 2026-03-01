import type { FeatureCollection } from "geojson";

export interface MapContent {
  type: "map";
  version: "1.0";
  title?: string;
  center?: { lat: number; lon: number };
  zoom?: number;
  bounds?: { south: number; west: number; north: number; east: number };
  basemap?: "osm" | "satellite" | "terrain" | "dark";
  layers: MapLayer[];
  controls?: {
    zoom?: boolean;
    layers?: boolean | "leaflet" | "panel" | "none";
    scale?: boolean;
    fullscreen?: boolean;
  };
}

export type MapLayerType = "geojson" | "image" | "tiles";

export interface MapLayer {
  id: string;
  label: string;
  layer_type?: MapLayerType;
  visible?: boolean;
  opacity?: number;
  group?: string;
  // geojson layer fields
  features?: FeatureCollection;
  style?: LayerStyle;
  cluster?: { enabled: boolean; radius?: number };
  popup?: PopupTemplate;
  // image overlay fields
  image_url?: string;
  image_bounds?: [[number, number], [number, number]]; // [[south_lat, west_lng], [north_lat, east_lng]]
  // tile layer fields
  tile_url?: string;
  tile_attribution?: string;
  tile_min_zoom?: number;
  tile_max_zoom?: number;
}

export interface LayerStyle {
  color?: string;
  weight?: number;
  fillColor?: string;
  fillOpacity?: number;
  icon?: string;
  radius?: number;
}

export interface PopupTemplate {
  title: string;
  body?: string;
  fields?: string[];
  actions?: PopupAction[];
}

export interface PopupAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
  confirm?: string;
}
