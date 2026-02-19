import { z } from "zod";

export const layerStyleSchema = z.object({
  color: z.string().optional(),
  weight: z.number().optional(),
  fillColor: z.string().optional(),
  fillOpacity: z.number().optional(),
});

export const layerPopupSchema = z.object({
  title: z.string(),
  fields: z.array(z.string()).optional(),
});

export const layerDefSchema = z.object({
  id: z.string(),
  label: z.string(),
  visible: z.boolean().optional(),
  opacity: z.number().optional(),
  features: z.record(z.string(), z.unknown()).describe("GeoJSON FeatureCollection"),
  style: layerStyleSchema.optional(),
  popup: layerPopupSchema.optional(),
  group: z.string().optional(),
});

export const layersSchema = z.object({
  type: z.literal("layers"),
  version: z.literal("1.0"),
  title: z.string().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  zoom: z.number().optional(),
  basemap: z.enum(["osm", "satellite", "terrain", "dark"]).optional(),
  layers: z.array(layerDefSchema),
});

export type LayersContent = z.infer<typeof layersSchema>;
export type LayerDef = z.infer<typeof layerDefSchema>;
export type LayerStyle = z.infer<typeof layerStyleSchema>;
export type LayerPopup = z.infer<typeof layerPopupSchema>;
