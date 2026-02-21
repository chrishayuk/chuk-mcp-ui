import { z } from "zod";

export const evidenceItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["person", "document", "location", "event", "object"]),
  description: z.string().optional(),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const connectionSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  strength: z.enum(["strong", "medium", "weak"]).optional(),
});

export const investigationSchema = z.object({
  type: z.literal("investigation"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  evidence: z.array(evidenceItemSchema),
  connections: z.array(connectionSchema).optional(),
  notes: z.string().optional(),
});

export type InvestigationContent = z.infer<typeof investigationSchema>;
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type Connection = z.infer<typeof connectionSchema>;
