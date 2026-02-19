import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("spectrogram schema validation", () => {
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
    expect(validate(data)).toBe(true);
  });

  it("accepts spectrogram with all options", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
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
      colorMap: "viridis",
      showFrequencyAxis: true,
      showTimeAxis: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts viridis colorMap", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
      colorMap: "viridis",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts magma colorMap", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
      colorMap: "magma",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts inferno colorMap", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
      colorMap: "inferno",
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts grayscale colorMap", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
      colorMap: "grayscale",
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing data", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
    };
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts multi-frame multi-bin spectrogram", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 2048,
        hopSize: 1024,
        magnitudes: [
          [0.1, 0.2, 0.3, 0.4],
          [0.5, 0.6, 0.7, 0.8],
          [0.9, 0.8, 0.7, 0.6],
        ],
      },
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects data missing sampleRate", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
    };
    expect(validate(data)).toBe(false);
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
    expect(validate(data)).toBe(false);
  });

  it("accepts showFrequencyAxis as false", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
      showFrequencyAxis: false,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts showTimeAxis as false", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
      showTimeAxis: false,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts frequencyRange with min and max", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
      frequencyRange: { min: 100, max: 4000 },
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts timeRange with start and end", () => {
    const data = {
      type: "spectrogram",
      version: "1.0",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: [[0.5]],
      },
      timeRange: { start: 0, end: 2.5 },
    };
    expect(validate(data)).toBe(true);
  });
});
