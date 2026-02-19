import { describe, it, expect } from "vitest";
import { gisLegendSchema } from "./zod";

describe("gis-legend zod schema validation", () => {
  it("accepts minimal valid legend", () => {
    const data = {
      type: "gis-legend",
      version: "1.0",
      sections: [
        { items: [{ type: "point", label: "City" }] },
      ],
    };
    expect(gisLegendSchema.safeParse(data).success).toBe(true);
  });

  it("accepts legend with all item types", () => {
    const data = {
      type: "gis-legend",
      version: "1.0",
      title: "Full Legend",
      orientation: "vertical",
      sections: [
        {
          title: "Symbols",
          items: [
            { type: "point", label: "City", color: "#3b82f6", fillColor: "#3b82f6", strokeColor: "#1d4ed8", strokeWidth: 1, size: 10 },
            { type: "line", label: "Road", color: "#333", strokeColor: "#333", strokeWidth: 2 },
            { type: "polygon", label: "Park", fillColor: "#22c55e", strokeColor: "#166534" },
            { type: "gradient", label: "Elevation", gradientStops: [
              { value: "0%", color: "#22c55e" },
              { value: "100%", color: "#dc2626" },
            ] },
            { type: "icon", label: "Airport", icon: "\u2708" },
          ],
        },
      ],
    };
    expect(gisLegendSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all item type values", () => {
    const types = ["point", "line", "polygon", "gradient", "icon"] as const;
    for (const t of types) {
      const data = {
        type: "gis-legend" as const,
        version: "1.0" as const,
        sections: [
          { items: [{ type: t, label: "Test" }] },
        ],
      };
      expect(gisLegendSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts both orientation values", () => {
    for (const orientation of ["vertical", "horizontal"] as const) {
      const data = {
        type: "gis-legend" as const,
        version: "1.0" as const,
        orientation,
        sections: [{ items: [{ type: "point" as const, label: "Dot" }] }],
      };
      expect(gisLegendSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing sections", () => {
    const data = {
      type: "gis-legend",
      version: "1.0",
      title: "No Sections",
    };
    expect(gisLegendSchema.safeParse(data).success).toBe(false);
  });

  it("rejects item missing type", () => {
    const data = {
      type: "gis-legend",
      version: "1.0",
      sections: [
        { items: [{ label: "Missing Type" }] },
      ],
    };
    expect(gisLegendSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "status",
      version: "1.0",
      sections: [
        { items: [{ type: "point", label: "Dot" }] },
      ],
    };
    expect(gisLegendSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid item type value", () => {
    const data = {
      type: "gis-legend",
      version: "1.0",
      sections: [
        { items: [{ type: "heatmap", label: "Invalid" }] },
      ],
    };
    expect(gisLegendSchema.safeParse(data).success).toBe(false);
  });
});
