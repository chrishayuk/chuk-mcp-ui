export interface GisLegendContent {
  type: "gis-legend";
  version: "1.0";
  title?: string;
  sections: GisLegendSection[];
  orientation?: "vertical" | "horizontal";
}

export interface GisLegendSection {
  title?: string;
  items: GisLegendItem[];
}

export interface GisLegendItem {
  type: "point" | "line" | "polygon" | "gradient" | "icon";
  label: string;
  color?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  size?: number;
  icon?: string;
  gradientStops?: GisLegendGradientStop[];
}

export interface GisLegendGradientStop {
  value: string;
  color: string;
}
