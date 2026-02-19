export interface QuizContent {
  type: "quiz";
  version: "1.0";
  title: string;
  description?: string;
  questions: QuizQuestion[];
  settings?: QuizSettings;
  validateTool: string;
  completeTool?: string;
}

export interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "image-choice";
  prompt: string;
  image?: { url: string; alt?: string };
  options: QuizOption[];
  timeLimit?: number;
  explanation?: string;
  points?: number;
  category?: string;
}

export interface QuizOption {
  id: string;
  label: string;
  image?: { url: string; alt?: string };
}

export interface QuizSettings {
  timeLimit?: number;
  timeLimitMode?: "total" | "per-question";
  showExplanation?: boolean;
  showProgress?: boolean;
  showScore?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  passingScore?: number;
}

export interface QuizResult {
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
  correctOptionId: string;
  pointsEarned: number;
}
