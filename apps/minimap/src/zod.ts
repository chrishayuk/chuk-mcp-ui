import { z } from "zod";

export const minimapLayerStyleSchema = z.object({
  color: z.string().optional(),
  weight: z.number().optional(),
  fillColor: z.string().optional(),
  fillOpacity: z.number().optional(),
  radius: z.number().optional(),
});

export const minimapPopupSchema = z.object({
  title: z.string(),
  fields: z.array(z.string()).optional(),
});

export const minimapLayerSchema = z.object({
  id: z.string(),
  label: z.string(),
  visible: z.boolean().optional(),
  features: z.record(z.string(), z.unknown()).describe("GeoJSON FeatureCollection"),
  style: minimapLayerStyleSchema.optional(),
  popup: minimapPopupSchema.optional(),
});

export const minimapPanelSchema = z.object({
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  zoom: z.number().optional(),
  basemap: z.enum(["osm", "satellite", "terrain", "dark"]).optional(),
  layers: z.array(minimapLayerSchema),
});

export const minimapSchema = z.object({
  type: z.literal("minimap"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  overview: minimapPanelSchema,
  detail: minimapPanelSchema,
  linkZoom: z.boolean().optional(),
  layout: z.enum(["horizontal", "vertical"]).optional(),
  ratio: z.string().optional(),
});

export type MinimapContent = z.infer<typeof minimapSchema>;
export type MinimapPanel = z.infer<typeof minimapPanelSchema>;
export type MinimapLayer = z.infer<typeof minimapLayerSchema>;
