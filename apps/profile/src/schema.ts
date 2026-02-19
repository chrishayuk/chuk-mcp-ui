export interface ProfileContent {
  type: "profile";
  version: "1.0";
  title?: string;
  points: ProfilePoint[];
  xLabel?: string;
  yLabel?: string;
  fill?: boolean;
  color?: string;
  markers?: ProfileMarker[];
}

export interface ProfilePoint {
  x: number;
  y: number;
}

export interface ProfileMarker {
  x: number;
  label: string;
  color?: string;
  icon?: string;
}
