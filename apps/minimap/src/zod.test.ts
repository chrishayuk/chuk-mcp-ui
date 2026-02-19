import { describe, it, expect } from "vitest";
import { minimapSchema } from "./zod";

const minimalLayer = {
  id: "l1",
  label: "Layer 1",
  features: { type: "FeatureCollection", features: [] },
};

const pointLayer = {
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
};

describe("minimap zod schema validation", () => {
  it("accepts minimal valid minimap", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      overview: { layers: [minimalLayer] },
      detail: { layers: [minimalLayer] },
    };
    expect(minimapSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full minimap with all options", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      title: "Dual Map View",
      linkZoom: true,
      layout: "horizontal",
      ratio: "1:2",
      overview: {
        center: { lat: 51.505, lon: -0.09 },
        zoom: 8,
        basemap: "satellite",
        layers: [
          {
            ...pointLayer,
            visible: true,
            style: {
              color: "#ff0000",
              weight: 3,
              fillColor: "#ff000033",
              fillOpacity: 0.5,
              radius: 8,
            },
            popup: {
              title: "Site",
              fields: ["name"],
            },
          },
        ],
      },
      detail: {
        center: { lat: 51.505, lon: -0.09 },
        zoom: 14,
        basemap: "dark",
        layers: [pointLayer],
      },
    };
    expect(minimapSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all basemap types", () => {
    for (const basemap of ["osm", "satellite", "terrain", "dark"] as const) {
      const data = {
        type: "minimap" as const,
        version: "1.0" as const,
        overview: { basemap, layers: [minimalLayer] },
        detail: { layers: [minimalLayer] },
      };
      expect(minimapSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts both layout values", () => {
    for (const layout of ["horizontal", "vertical"] as const) {
      const data = {
        type: "minimap" as const,
        version: "1.0" as const,
        layout,
        overview: { layers: [minimalLayer] },
        detail: { layers: [minimalLayer] },
      };
      expect(minimapSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing overview", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      detail: { layers: [minimalLayer] },
    };
    expect(minimapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing detail", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      overview: { layers: [minimalLayer] },
    };
    expect(minimapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "map",
      version: "1.0",
      overview: { layers: [minimalLayer] },
      detail: { layers: [minimalLayer] },
    };
    expect(minimapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects layer missing id", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      overview: {
        layers: [{ label: "L", features: { type: "FeatureCollection", features: [] } }],
      },
      detail: { layers: [minimalLayer] },
    };
    expect(minimapSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid basemap value", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      overview: { basemap: "google", layers: [minimalLayer] },
      detail: { layers: [minimalLayer] },
    };
    expect(minimapSchema.safeParse(data).success).toBe(false);
  });
});
