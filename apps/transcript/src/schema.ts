export interface TranscriptContent {
  type: "transcript";
  version: "1.0";
  title?: string;
  description?: string;
  entries: TranscriptEntry[];
  speakers?: SpeakerInfo[];
  /** Show search bar */
  searchable?: boolean;
  /** Show timestamps */
  showTimestamps?: boolean;
}

export interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  /** ISO timestamp or seconds offset */
  timestamp?: string;
  /** Duration in seconds */
  duration?: number;
  /** Confidence score 0-1 */
  confidence?: number;
  /** Language code */
  language?: string;
}

export interface SpeakerInfo {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
  role?: string;
}
