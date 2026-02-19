export interface MinimapContent {
  type: "minimap";
  version: "1.0";
  title?: string;
  overview: MinimapPanel;
  detail: MinimapPanel;
  linkZoom?: boolean;
  layout?: "horizontal" | "vertical";
  ratio?: string;
}

export interface MinimapPanel {
  center?: { lat: number; lon: number };
  zoom?: number;
  basemap?: "osm" | "satellite" | "terrain" | "dark";
  layers: MinimapLayer[];
}

export interface MinimapLayer {
  id: string;
  label: string;
  visible?: boolean;
  features: object;
  style?: MinimapLayerStyle;
  popup?: MinimapPopup;
}

export interface MinimapLayerStyle {
  color?: string;
  weight?: number;
  fillColor?: string;
  fillOpacity?: number;
  radius?: number;
}

export interface MinimapPopup {
  title: string;
  fields?: string[];
}
