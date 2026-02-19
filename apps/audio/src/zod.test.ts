import { describe, it, expect } from "vitest";
import { audioSchema } from "./zod";

describe("audio zod schema validation", () => {
  it("accepts minimal valid input", () => {
    const data = { type: "audio", version: "1.0", url: "https://example.com/audio.mp3" };
    expect(audioSchema.safeParse(data).success).toBe(true);
  });

  it("accepts full input with all optional fields", () => {
    const data = {
      type: "audio",
      version: "1.0",
      url: "https://example.com/audio.mp3",
      title: "My Podcast",
      waveform: [0.1, 0.5, 0.9, 0.3, 0.7],
      duration: 185,
      regions: [
        { id: "intro", start: 0, end: 30, label: "Intro", color: "#22c55e" },
      ],
      autoplay: true,
      loop: true,
    };
    expect(audioSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing url", () => {
    const data = { type: "audio", version: "1.0" };
    expect(audioSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = { version: "1.0", url: "https://example.com/audio.mp3" };
    expect(audioSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = { type: "video", version: "1.0", url: "https://example.com/audio.mp3" };
    expect(audioSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong version", () => {
    const data = { type: "audio", version: "2.0", url: "https://example.com/audio.mp3" };
    expect(audioSchema.safeParse(data).success).toBe(false);
  });

  it("rejects negative duration", () => {
    const data = {
      type: "audio",
      version: "1.0",
      url: "https://example.com/audio.mp3",
      duration: -5,
    };
    expect(audioSchema.safeParse(data).success).toBe(false);
  });

  it("rejects waveform values above 1", () => {
    const data = {
      type: "audio",
      version: "1.0",
      url: "https://example.com/audio.mp3",
      waveform: [0.5, 1.5],
    };
    expect(audioSchema.safeParse(data).success).toBe(false);
  });

  it("rejects region with negative start", () => {
    const data = {
      type: "audio",
      version: "1.0",
      url: "https://example.com/audio.mp3",
      regions: [{ id: "r1", start: -1, end: 10 }],
    };
    expect(audioSchema.safeParse(data).success).toBe(false);
  });

  it("accepts region without optional label and color", () => {
    const data = {
      type: "audio",
      version: "1.0",
      url: "https://example.com/audio.mp3",
      regions: [{ id: "r1", start: 0, end: 30 }],
    };
    expect(audioSchema.safeParse(data).success).toBe(true);
  });
});
