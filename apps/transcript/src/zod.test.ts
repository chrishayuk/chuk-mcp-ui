import { describe, it, expect } from "vitest";
import { transcriptSchema } from "./zod";

describe("transcript zod schema validation", () => {
  it("accepts minimal valid transcript", () => {
    const data = {
      type: "transcript",
      version: "1.0",
      entries: [],
    };
    expect(transcriptSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full transcript with all optional fields", () => {
    const data = {
      type: "transcript",
      version: "1.0",
      title: "Interview Transcript",
      description: "Technical interview conducted on 2025-12-10.",
      searchable: true,
      showTimestamps: true,
      speakers: [
        {
          id: "interviewer",
          name: "Sarah Chen",
          color: "#3b82f6",
          avatar: "https://example.com/avatar.png",
          role: "Interviewer",
        },
        {
          id: "candidate",
          name: "Alex Rivera",
          color: "#22c55e",
          role: "Candidate",
        },
      ],
      entries: [
        {
          id: "e1",
          speaker: "interviewer",
          text: "Tell me about your background.",
          timestamp: "0",
          duration: 12,
          confidence: 0.95,
          language: "en",
        },
        {
          id: "e2",
          speaker: "candidate",
          text: "I have five years of experience.",
          timestamp: "15",
          duration: 18,
        },
      ],
    };
    expect(transcriptSchema.safeParse(data).success).toBe(true);
  });

  it("accepts entries with ISO timestamps", () => {
    const data = {
      type: "transcript" as const,
      version: "1.0" as const,
      entries: [
        {
          id: "m1",
          speaker: "host",
          text: "Welcome everyone.",
          timestamp: "2025-12-10T09:00:00Z",
        },
      ],
    };
    expect(transcriptSchema.safeParse(data).success).toBe(true);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chat",
      version: "1.0",
      entries: [],
    };
    expect(transcriptSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      entries: [],
    };
    expect(transcriptSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "transcript",
      entries: [],
    };
    expect(transcriptSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing entries", () => {
    const data = {
      type: "transcript",
      version: "1.0",
    };
    expect(transcriptSchema.safeParse(data).success).toBe(false);
  });

  it("rejects entry missing required fields", () => {
    const data = {
      type: "transcript" as const,
      version: "1.0" as const,
      entries: [{ speaker: "host", text: "Hello" }],
    };
    expect(transcriptSchema.safeParse(data).success).toBe(false);
  });

  it("rejects speaker missing required fields", () => {
    const data = {
      type: "transcript" as const,
      version: "1.0" as const,
      entries: [],
      speakers: [{ id: "host" }],
    };
    expect(transcriptSchema.safeParse(data).success).toBe(false);
  });
});
