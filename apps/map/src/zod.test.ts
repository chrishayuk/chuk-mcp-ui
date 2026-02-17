import { describe, it, expect } from "vitest";
import { mapSchema } from "./zod";

describe("map zod schema validation", () => {
  it("accepts minimal valid map with one layer", () => {
    const data = {
      type: "map",
      version: "1.0",
      layers: [
        {
          id: "sites",
          label: "Sites",
          features: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: [-0.09, 51.505] },
                properties: { name: "London" },
              },
            ],
          },
        },
      ],
    };
    expect(mapSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full map with all options", () => {
    const data = {
      type: "map",
      version: "1.0",
      center: { lat: 51.505, lon: -0.09 },
      zoom: 12,
      bounds: { south: 51.0, west: -0.5, north: 52.0, east: 0.5 },
      basemap: "dark",
      layers: [
        {
          id: "layer1",
          label: "Markers",
          visible: true,
          opacity: 0.8,
          features: { type: "FeatureCollection", features: [] },
          style: {
            color: "#ff0000",
            weight: 3,
            fillColor: "#ff000033",
            fillOpacity: 0.5,
            radius: 8,
          },
          cluster: { enabled: true, radius: 60 },
          popup: {
            title: "{properties.name}",
            body: "{properties.description}",
            fields: ["name", "type"],
            actions: [
              {
                label: "View Details",
                tool: "get-site",
                arguments: { id: "{properties.id}" },
                confirm: "Load details?",
              },
            ],
          },
        },
      ],
      controls: {
        zoom: true,
        layers: true,
        scale: true,
        fullscreen: false,
      },
    };
    expect(mapSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all basemap types", () => {
    for (const basemap of ["osm", "satellite", "terrain", "dark"]) {
      const data = {
        type: "map",
        version: "1.0",
        basemap,
        layers: [
          { id: "l", label: "L", features: { type: "FeatureCollection", features: [] } },
        ],
      };
      expect(mapSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing layers", () => {
    const data = {
      type: "map",
      version: "1.0",
    };
    expect(mapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      layers: [],
    };
    expect(mapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      layers: [],
    };
    expect(mapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects layer missing id", () => {
    const data = {
      type: "map",
      version: "1.0",
      layers: [
        { label: "L", features: { type: "FeatureCollection", features: [] } },
      ],
    };
    expect(mapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects layer missing features", () => {
    const data = {
      type: "map",
      version: "1.0",
      layers: [{ id: "l", label: "L" }],
    };
    expect(mapSchema.safeParse(data).success).toBe(false);
  });

  it("accepts empty layers array", () => {
    const data = {
      type: "map",
      version: "1.0",
      layers: [],
    };
    expect(mapSchema.safeParse(data).success).toBe(true);
  });

  it("rejects invalid basemap value", () => {
    const data = {
      type: "map",
      version: "1.0",
      basemap: "google",
      layers: [],
    };
    expect(mapSchema.safeParse(data).success).toBe(false);
  });
});
