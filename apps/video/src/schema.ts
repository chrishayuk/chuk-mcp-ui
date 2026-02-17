export interface VideoContent {
  type: "video";
  version: "1.0";
  url: string;
  title?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  startTime?: number;
}
