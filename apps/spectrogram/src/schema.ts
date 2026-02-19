export interface SpectrogramData {
  sampleRate: number;
  fftSize: number;
  hopSize: number;
  magnitudes: number[][];
}

export interface SpectrogramContent {
  type: "spectrogram";
  version: "1.0";
  title?: string;
  data: SpectrogramData;
  frequencyRange?: { min: number; max: number };
  timeRange?: { start: number; end: number };
  colorMap?: "viridis" | "magma" | "inferno" | "grayscale";
  showFrequencyAxis?: boolean;
  showTimeAxis?: boolean;
}
