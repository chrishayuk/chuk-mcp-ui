import { z } from "zod";

export const popupActionSchema = z.object({
  label: z.string(),
  tool: z.string(),
  arguments: z.record(z.string(), z.string()),
  confirm: z.string().optional(),
});

export const popupTemplateSchema = z.object({
  title: z.string(),
  body: z.string().optional(),
  fields: z.array(z.string()).optional(),
  actions: z.array(popupActionSchema).optional(),
});

export const layerStyleSchema = z.object({
  color: z.string().optional(),
  weight: z.number().optional(),
  fillColor: z.string().optional(),
  fillOpacity: z.number().optional(),
  icon: z.string().optional(),
  radius: z.number().optional(),
});

export const clusterConfigSchema = z.object({
  enabled: z.boolean(),
  radius: z.number().optional(),
});

export const mapLayerSchema = z.object({
  id: z.string(),
  label: z.string(),
  visible: z.boolean().optional(),
  opacity: z.number().optional(),
  features: z.record(z.string(), z.unknown()).describe("GeoJSON FeatureCollection"),
  style: layerStyleSchema.optional(),
  cluster: clusterConfigSchema.optional(),
  popup: popupTemplateSchema.optional(),
});

export const mapSchema = z.object({
  type: z.literal("map"),
  version: z.literal("1.0"),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  zoom: z.number().optional(),
  bounds: z.object({
    south: z.number(),
    west: z.number(),
    north: z.number(),
    east: z.number(),
  }).optional(),
  basemap: z.enum(["osm", "satellite", "terrain", "dark"]).optional(),
  layers: z.array(mapLayerSchema),
  controls: z.object({
    zoom: z.boolean().optional(),
    layers: z.boolean().optional(),
    scale: z.boolean().optional(),
    fullscreen: z.boolean().optional(),
  }).optional(),
});

export type MapContent = z.infer<typeof mapSchema>;
export type MapLayer = z.infer<typeof mapLayerSchema>;
export type PopupAction = z.infer<typeof popupActionSchema>;
