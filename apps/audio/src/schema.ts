export interface AudioRegion {
  id: string;
  start: number;
  end: number;
  label?: string;
  color?: string;
}

export interface AudioContent {
  type: "audio";
  version: "1.0";
  title?: string;
  url: string;
  waveform?: number[];
  duration?: number;
  regions?: AudioRegion[];
  autoplay?: boolean;
  loop?: boolean;
}
