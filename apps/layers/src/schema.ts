export interface LayersContent {
  type: "layers";
  version: "1.0";
  title?: string;
  center?: { lat: number; lon: number };
  zoom?: number;
  basemap?: "osm" | "satellite" | "terrain" | "dark";
  layers: LayerDef[];
}

export interface LayerDef {
  id: string;
  label: string;
  visible?: boolean;
  opacity?: number;
  features: object; // GeoJSON FeatureCollection
  style?: LayerStyle;
  popup?: LayerPopup;
  group?: string;
}

export interface LayerStyle {
  color?: string;
  weight?: number;
  fillColor?: string;
  fillOpacity?: number;
}

export interface LayerPopup {
  title: string;
  fields?: string[];
}
