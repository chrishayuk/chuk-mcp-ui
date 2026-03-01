/** Style options for GeoJSON layers. */
export interface LeafletLayerStyle {
  color?: string;
  weight?: number;
  fillColor?: string;
  fillOpacity?: number;
  icon?: string;
  radius?: number;
}

/** Base popup definition (map extends this with actions). */
export interface LeafletPopup {
  title: string;
  body?: string;
  fields?: string[];
}

/** Basemap key. */
export type BasemapKey = "osm" | "satellite" | "terrain" | "dark";
