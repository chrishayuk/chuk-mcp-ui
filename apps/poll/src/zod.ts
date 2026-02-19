import { z } from "zod";

export const pollOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  image: z.object({
    url: z.string(),
    alt: z.string().optional(),
  }).optional(),
  color: z.string().optional(),
});

export const pollQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["single-choice", "multi-choice", "rating", "ranking"]),
  prompt: z.string(),
  image: z.object({
    url: z.string(),
    alt: z.string().optional(),
  }).optional(),
  options: z.array(pollOptionSchema),
  maxSelections: z.number().optional(),
});

export const pollVoteSchema = z.object({
  optionId: z.string(),
  count: z.number(),
  percentage: z.number(),
});

export const pollResultsSchema = z.object({
  questionId: z.string(),
  votes: z.array(pollVoteSchema),
  totalVotes: z.number(),
});

export const pollSettingsSchema = z.object({
  showResults: z.enum(["after-vote", "live", "after-close"]).optional(),
  allowChange: z.boolean().optional(),
  multiQuestion: z.boolean().optional(),
  anonymous: z.boolean().optional(),
  closedMessage: z.string().optional(),
});

export const pollSchema = z.object({
  type: z.literal("poll"),
  version: z.literal("1.0"),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(pollQuestionSchema),
  settings: pollSettingsSchema.optional(),
  voteTool: z.string(),
  resultsTool: z.string().optional(),
});

export type PollContent = z.infer<typeof pollSchema>;
export type PollQuestion = z.infer<typeof pollQuestionSchema>;
export type PollOption = z.infer<typeof pollOptionSchema>;
export type PollResults = z.infer<typeof pollResultsSchema>;
export type PollVote = z.infer<typeof pollVoteSchema>;
export type PollSettings = z.infer<typeof pollSettingsSchema>;
