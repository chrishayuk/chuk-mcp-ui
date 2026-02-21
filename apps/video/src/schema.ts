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
  /** Runtime playback state — true = playing, false = paused */
  playing?: boolean;
  /** Seek to this position (seconds) */
  currentTime?: number;
  /** Playback speed multiplier (default 1.0) */
  playbackRate?: number;
  /** Volume level 0.0–1.0 */
  volume?: number;
}
