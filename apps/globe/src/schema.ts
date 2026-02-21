export interface GlobeContent {
  type: "globe";
  version: "1.0";
  title?: string;
  points: GlobePoint[];
  arcs?: GlobeArc[];
  rotation?: { lat: number; lon: number };
}

export interface GlobePoint {
  id: string;
  lat: number;
  lon: number;
  label: string;
  color?: string;
  size?: number;
}

export interface GlobeArc {
  from: string;
  to: string;
  color?: string;
  label?: string;
}
