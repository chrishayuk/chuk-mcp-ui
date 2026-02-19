export interface RankedContent {
  type: "ranked";
  version: "1.0";
  title?: string;
  items: RankedItem[];
  maxScore?: number;
  showDelta?: boolean;
  scoreLabel?: string;
  scoreSuffix?: string;
}

export interface RankedItem {
  id: string;
  rank: number;
  title: string;
  subtitle?: string;
  score: number;
  previousRank?: number;
  badges?: RankedBadge[];
  metadata?: Record<string, string>;
  image?: { url: string; alt?: string };
  actions?: RankedAction[];
}

export interface RankedBadge {
  label: string;
  variant?: "default" | "secondary" | "outline";
}

export interface RankedAction {
  label: string;
  tool: string;
  arguments: Record<string, string>;
}
