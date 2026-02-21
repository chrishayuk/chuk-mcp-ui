import { z } from "zod";

export const neuralLayerSchema = z.object({
  name: z.string(),
  type: z.enum(["input", "dense", "conv", "pooling", "dropout", "output"]),
  units: z.number(),
  activation: z.string().optional(),
  color: z.string().optional(),
});

export const neuralSchema = z.object({
  type: z.literal("neural"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  layers: z.array(neuralLayerSchema),
  showWeights: z.boolean().optional(),
});

export type NeuralContent = z.infer<typeof neuralSchema>;
export type NeuralLayer = z.infer<typeof neuralLayerSchema>;
