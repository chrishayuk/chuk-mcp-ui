import { z } from "zod";

export const shaderUniformSchema = z.object({
  name: z.string(),
  type: z.enum(["float", "vec2", "vec3", "vec4", "int"]),
  value: z.union([z.number(), z.array(z.number())]),
  min: z.number().optional(),
  max: z.number().optional(),
  label: z.string().optional(),
});

export const shaderSchema = z.object({
  type: z.literal("shader"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  description: z.string().optional(),
  fragmentShader: z.string(),
  vertexShader: z.string().optional(),
  uniforms: z.array(shaderUniformSchema).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  animate: z.boolean().optional(),
});

export type ShaderContent = z.infer<typeof shaderSchema>;
export type ShaderUniform = z.infer<typeof shaderUniformSchema>;
