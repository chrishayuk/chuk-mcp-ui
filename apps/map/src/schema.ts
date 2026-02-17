import type { FeatureCollection } from "geojson";

export interface MapContent {
  type: "map";
  version: "1.0";
  center?: { lat: number; lon: number };
  zoom?: number;
  bounds?: { south: number; west: number; north: number; east: number };
  basemap?: "osm" | "satellite" | "terrain" | "dark";
  layers: MapLayer[];
  controls?: {
    zoom?: boolean;
    layers?: boolean;
    scale?: boolean;
    fullscreen?: boolean;
  };
}

export interface MapLayer {
  id: string;
  label: string;
  visible?: boolean;
  opacity?: number;
  features: FeatureCollection;
  style?: LayerStyle;
  cluster?: { enabled: boolean; radius?: number };
  popup?: PopupTemplate;
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
