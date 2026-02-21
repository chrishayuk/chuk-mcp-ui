import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("investigation schema validation", () => {
  it("accepts minimal valid investigation", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", label: "Suspect A", type: "person" }],
    };
    expect(validate(data)).toBe(true);
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
          type: "person",
          description: "Primary suspect",
          image: "https://example.com/photo.jpg",
          tags: ["suspect", "interviewed"],
          metadata: { age: "35", occupation: "engineer" },
        },
        {
          id: "e2",
          label: "Contract",
          type: "document",
          description: "Employment contract found at scene",
          tags: ["forensic"],
        },
      ],
      connections: [
        {
          from: "e1",
          to: "e2",
          label: "authored",
          strength: "strong",
        },
      ],
      notes: "Follow up on the timeline discrepancy.",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all evidence type values", () => {
    const types = ["person", "document", "location", "event", "object"];
    for (const evidenceType of types) {
      const data = {
        type: "investigation",
        version: "1.0",
        evidence: [{ id: "e1", label: "Item", type: evidenceType }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("accepts all connection strength values", () => {
    const strengths = ["strong", "medium", "weak"];
    for (const strength of strengths) {
      const data = {
        type: "investigation",
        version: "1.0",
        evidence: [{ id: "e1", label: "Item", type: "person" }],
        connections: [{ from: "e1", to: "e2", strength }],
      };
      expect(validate(data)).toBe(true);
    }
  });

  it("rejects missing evidence", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      title: "No Evidence",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects evidence missing id", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ label: "Item", type: "person" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects evidence missing label", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", type: "person" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects evidence missing type", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", label: "Item" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "timeline",
      version: "1.0",
      evidence: [{ id: "e1", label: "Item", type: "person" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid evidence type value", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", label: "Item", type: "weapon" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid connection strength value", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", label: "Item", type: "person" }],
      connections: [{ from: "e1", to: "e2", strength: "critical" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects connection missing from", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", label: "Item", type: "person" }],
      connections: [{ to: "e2" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects connection missing to", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", label: "Item", type: "person" }],
      connections: [{ from: "e1" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "investigation",
      version: "1.0",
      evidence: [{ id: "e1", label: "Item", type: "person" }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
