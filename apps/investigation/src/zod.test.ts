import { describe, it, expect } from "vitest";
import { investigationSchema } from "./zod";

describe("investigation zod schema validation", () => {
  it("accepts minimal valid investigation", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", label: "Suspect A", type: "person" }],
    };
    expect(investigationSchema.safeParse(data).success).toBe(true);
  });

  it("accepts investigation with all options", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      title: "Cold Case #42",
      evidence: [
        {
          id: "e1",
          label: "John Doe",
          type: "person" as const,
          description: "Primary suspect",
          image: "https://example.com/photo.jpg",
          tags: ["suspect", "interviewed"],
          metadata: { age: "35", occupation: "engineer" },
        },
        {
          id: "e2",
          label: "Contract",
          type: "document" as const,
          description: "Employment contract found at scene",
          tags: ["forensic"],
        },
      ],
      connections: [
        {
          from: "e1",
          to: "e2",
          label: "authored",
          strength: "strong" as const,
        },
      ],
      notes: "Follow up on the timeline discrepancy.",
    };
    expect(investigationSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all evidence type values", () => {
    const types = ["person", "document", "location", "event", "object"] as const;
    for (const evidenceType of types) {
      const data = {
        type: "investigation" as const,
        version: "1.0" as const,
        evidence: [{ id: "e1", label: "Item", type: evidenceType }],
      };
      expect(investigationSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts all connection strength values", () => {
    const strengths = ["strong", "medium", "weak"] as const;
    for (const strength of strengths) {
      const data = {
        type: "investigation" as const,
        version: "1.0" as const,
        evidence: [{ id: "e1", label: "Item", type: "person" as const }],
        connections: [{ from: "e1", to: "e2", strength }],
      };
      expect(investigationSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing evidence", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      title: "No Evidence",
    };
    expect(investigationSchema.safeParse(data).success).toBe(false);
  });

  it("rejects evidence missing id", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ label: "Item", type: "person" }],
    };
    expect(investigationSchema.safeParse(data).success).toBe(false);
  });

  it("rejects evidence missing label", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", type: "person" }],
    };
    expect(investigationSchema.safeParse(data).success).toBe(false);
  });

  it("rejects evidence missing type", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", label: "Item" }],
    };
    expect(investigationSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      evidence: [{ id: "e1", label: "Item", type: "person" }],
    };
    expect(investigationSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid evidence type value", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", label: "Item", type: "weapon" }],
    };
    expect(investigationSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid connection strength value", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", label: "Item", type: "person" }],
      connections: [{ from: "e1", to: "e2", strength: "critical" }],
    };
    expect(investigationSchema.safeParse(data).success).toBe(false);
  });
});
