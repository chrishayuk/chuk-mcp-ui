import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

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

describe("minimap schema validation", () => {
  it("accepts minimal valid minimap", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      overview: { layers: [minimalLayer] },
      detail: { layers: [minimalLayer] },
    };
    expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
  });

  it("accepts all basemap types on overview", () => {
    for (const basemap of ["osm", "satellite", "terrain", "dark"]) {
      const data = {
        type: "minimap",
        version: "1.0",
        overview: { basemap, layers: [minimalLayer] },
        detail: { layers: [minimalLayer] },
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts all basemap types on detail", () => {
    for (const basemap of ["osm", "satellite", "terrain", "dark"]) {
      const data = {
        type: "minimap",
        version: "1.0",
        overview: { layers: [minimalLayer] },
        detail: { basemap, layers: [minimalLayer] },
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts both layout values", () => {
    for (const layout of ["horizontal", "vertical"]) {
      const data = {
        type: "minimap",
        version: "1.0",
        layout,
        overview: { layers: [minimalLayer] },
        detail: { layers: [minimalLayer] },
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing overview", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      detail: { layers: [minimalLayer] },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing detail", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      overview: { layers: [minimalLayer] },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      overview: { layers: [minimalLayer] },
      detail: { layers: [minimalLayer] },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "map",
      version: "1.0",
      overview: { layers: [minimalLayer] },
      detail: { layers: [minimalLayer] },
    };
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
  });

  it("rejects layer missing features", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      overview: { layers: [{ id: "l", label: "L" }] },
      detail: { layers: [minimalLayer] },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects panel missing layers", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      overview: { center: { lat: 0, lon: 0 } },
      detail: { layers: [minimalLayer] },
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts empty layers arrays", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      overview: { layers: [] },
      detail: { layers: [] },
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects invalid basemap value", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      overview: { basemap: "google", layers: [minimalLayer] },
      detail: { layers: [minimalLayer] },
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid layout value", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      layout: "diagonal",
      overview: { layers: [minimalLayer] },
      detail: { layers: [minimalLayer] },
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields at root", () => {
    const data = {
      type: "minimap",
      version: "1.0",
      overview: { layers: [minimalLayer] },
      detail: { layers: [minimalLayer] },
      experimental: true,
    };
    expect(validate(data)).toBe(true);
  });
});
