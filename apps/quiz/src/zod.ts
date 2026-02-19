import { z } from "zod";

export const quizOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  image: z
    .object({
      url: z.string(),
      alt: z.string().optional(),
    })
    .optional(),
});

export const quizQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["multiple-choice", "true-false", "image-choice"]),
  prompt: z.string(),
  image: z
    .object({
      url: z.string(),
      alt: z.string().optional(),
    })
    .optional(),
  options: z.array(quizOptionSchema),
  timeLimit: z.number().optional(),
  explanation: z.string().optional(),
  points: z.number().optional(),
  category: z.string().optional(),
});

export const quizSettingsSchema = z.object({
  timeLimit: z.number().optional(),
  timeLimitMode: z.enum(["total", "per-question"]).optional(),
  showExplanation: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  showScore: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  passingScore: z.number().optional(),
});

export const quizContentSchema = z.object({
  type: z.literal("quiz"),
  version: z.literal("1.0"),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(quizQuestionSchema),
  settings: quizSettingsSchema.optional(),
  validateTool: z.string(),
  completeTool: z.string().optional(),
});

export const quizResultSchema = z.object({
  questionId: z.string(),
  selectedOptionId: z.string(),
  correct: z.boolean(),
  correctOptionId: z.string(),
  pointsEarned: z.number(),
});

export type QuizContent = z.infer<typeof quizContentSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizOption = z.infer<typeof quizOptionSchema>;
export type QuizSettings = z.infer<typeof quizSettingsSchema>;
export type QuizResult = z.infer<typeof quizResultSchema>;
