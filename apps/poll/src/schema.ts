export interface PollContent {
  type: "poll";
  version: "1.0";
  title: string;
  description?: string;
  questions: PollQuestion[];
  settings?: PollSettings;
  voteTool: string;
  resultsTool?: string;
}

export interface PollQuestion {
  id: string;
  type: "single-choice" | "multi-choice" | "rating" | "ranking";
  prompt: string;
  image?: { url: string; alt?: string };
  options: PollOption[];
  maxSelections?: number;
}

export interface PollOption {
  id: string;
  label: string;
  image?: { url: string; alt?: string };
  color?: string;
}

export interface PollResults {
  questionId: string;
  votes: PollVote[];
  totalVotes: number;
}

export interface PollVote {
  optionId: string;
  count: number;
  percentage: number;
}

export interface PollSettings {
  showResults?: "after-vote" | "live" | "after-close";
  allowChange?: boolean;
  multiQuestion?: boolean;
  anonymous?: boolean;
  closedMessage?: string;
}
