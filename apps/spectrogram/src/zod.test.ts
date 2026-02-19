import { describe, it, expect } from "vitest";
import { spectrogramSchema } from "./zod";

describe("spectrogram zod schema validation", () => {
  it("accepts minimal valid spectrogram", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.1, 0.2, 0.3]],
      },
    };
    expect(spectrogramSchema.safeParse(data).success).toBe(true);
  });

  it("accepts spectrogram with all options", () => {
    const data = {
      type: "spectrogram" as const,
      version: "1.0" as const,
      title: "Speech Analysis",
      data: {
        sampleRate: 16000,
        fftSize: 256,
        hopSize: 128,
        magnitudes: [
          [0.1, 0.2, 0.3],
          [0.4, 0.5, 0.6],
        ],
      },
      frequencyRange: { min: 0, max: 8000 },
      timeRange: { start: 0, end: 1.5 },
      colorMap: "viridis" as const,
      showFrequencyAxis: true,
      showTimeAxis: true,
    };
    expect(spectrogramSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all colorMap values", () => {
    const maps = ["viridis", "magma", "inferno", "grayscale"] as const;
    for (const colorMap of maps) {
      const data = {
        type: "spectrogram" as const,
        version: "1.0" as const,
        data: {
          sampleRate: 44100,
          fftSize: 1024,
          hopSize: 512,
          magnitudes: [[0.5]],
        },
        colorMap,
      };
      expect(spectrogramSchema.safeParse(data).success).toBe(true);
    }
  });

  it("rejects missing data", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
    };
    expect(spectrogramSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "heatmap",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
    };
    expect(spectrogramSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid colorMap value", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
      colorMap: "rainbow",
    };
    expect(spectrogramSchema.safeParse(data).success).toBe(false);
  });

  it("rejects non-number magnitudes", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [["not-a-number"]],
      },
    };
    expect(spectrogramSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "spectrogram",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
    };
    expect(spectrogramSchema.safeParse(data).success).toBe(false);
  });

  it("rejects data missing magnitudes", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
      },
    };
    expect(spectrogramSchema.safeParse(data).success).toBe(false);
  });
});
