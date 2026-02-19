import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("layers schema validation", () => {
  it("accepts minimal valid layers with one layer", () => {
    const data = {
      type: "layers",
      version: "1.0",
      layers: [
        {
          id: "roads",
          label: "Roads",
          features: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: [[-0.14, 51.51], [-0.12, 51.515]],
                },
                properties: { name: "Oxford Street" },
              },
            ],
          },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts full layers with all options", () => {
    const data = {
      type: "layers",
      version: "1.0",
      title: "City Map",
      center: { lat: 51.505, lon: -0.09 },
      zoom: 12,
      basemap: "dark",
      layers: [
        {
          id: "layer1",
          label: "Roads",
          visible: true,
          opacity: 0.8,
          features: { type: "FeatureCollection", features: [] },
          style: {
            color: "#ff0000",
            weight: 3,
            fillColor: "#ff9999",
            fillOpacity: 0.5,
          },
          popup: {
            title: "{properties.name}",
            fields: ["name", "type"],
          },
          group: "Transport",
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all basemap types", () => {
    for (const basemap of ["osm", "satellite", "terrain", "dark"]) {
      const data = {
        type: "layers",
        version: "1.0",
        basemap,
        layers: [
          { id: "l", label: "L", features: { type: "FeatureCollection", features: [] } },
        ],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing layers", () => {
    const data = {
      type: "layers",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      layers: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "map",
      version: "1.0",
      layers: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects layer missing id", () => {
    const data = {
      type: "layers",
      version: "1.0",
      layers: [
        { label: "L", features: { type: "FeatureCollection", features: [] } },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects layer missing features", () => {
    const data = {
      type: "layers",
      version: "1.0",
      layers: [{ id: "l", label: "L" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts empty layers array", () => {
    const data = {
      type: "layers",
      version: "1.0",
      layers: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects invalid basemap value", () => {
    const data = {
      type: "layers",
      version: "1.0",
      basemap: "google",
      layers: [],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts layer with group field", () => {
    const data = {
      type: "layers",
      version: "1.0",
      layers: [
        {
          id: "roads",
          label: "Roads",
          group: "Transport",
          features: { type: "FeatureCollection", features: [] },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts layer with popup having only title", () => {
    const data = {
      type: "layers",
      version: "1.0",
      layers: [
        {
          id: "l1",
          label: "Layer 1",
          features: { type: "FeatureCollection", features: [] },
          popup: { title: "{properties.name}" },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects popup missing title", () => {
    const data = {
      type: "layers",
      version: "1.0",
      layers: [
        {
          id: "l1",
          label: "Layer 1",
          features: { type: "FeatureCollection", features: [] },
          popup: { fields: ["name"] },
        },
      ],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts layer with style only", () => {
    const data = {
      type: "layers",
      version: "1.0",
      layers: [
        {
          id: "styled",
          label: "Styled Layer",
          features: { type: "FeatureCollection", features: [] },
          style: { color: "#ff0000", weight: 3 },
        },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts title at top level", () => {
    const data = {
      type: "layers",
      version: "1.0",
      title: "My Layer Map",
      layers: [],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects layer missing label", () => {
    const data = {
      type: "layers",
      version: "1.0",
      layers: [
        { id: "l", features: { type: "FeatureCollection", features: [] } },
      ],
    };
    expect(validate(data)).toBe(false);
  });
});
