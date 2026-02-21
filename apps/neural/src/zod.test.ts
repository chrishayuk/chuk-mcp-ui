import { describe, it, expect } from "vitest";
import { neuralSchema } from "./zod";

describe("neural zod schema validation", () => {
  it("accepts minimal valid neural network", () => {
    const data = {
      type: "neural",
      version: "1.0",
      layers: [
        { name: "Input", type: "input", units: 784 },
        { name: "Output", type: "output", units: 10 },
      ],
    };
    expect(neuralSchema.safeParse(data).success).toBe(true);
  });

  it("accepts neural network with all options", () => {
    const data = {
      type: "neural",
      version: "1.0",
      title: "Image Classifier",
      layers: [
        { name: "Input", type: "input" as const, units: 784, color: "#3b82f6" },
        { name: "Hidden 1", type: "dense" as const, units: 128, activation: "relu", color: "#22c55e" },
        { name: "Dropout", type: "dropout" as const, units: 128 },
        { name: "Hidden 2", type: "dense" as const, units: 64, activation: "relu" },
        { name: "Output", type: "output" as const, units: 10, activation: "softmax" },
      ],
      showWeights: true,
    };
    expect(neuralSchema.safeParse(data).success).toBe(true);
  });

  it("accepts all layer types", () => {
    const types = ["input", "dense", "conv", "pooling", "dropout", "output"] as const;
    for (const layerType of types) {
      const data = {
        type: "neural" as const,
        version: "1.0" as const,
        layers: [{ name: "Layer", type: layerType, units: 32 }],
      };
      expect(neuralSchema.safeParse(data).success).toBe(true);
    }
  });

  it("accepts layers with activation functions", () => {
    const data = {
      type: "neural",
      version: "1.0",
      layers: [
        { name: "Input", type: "input", units: 784 },
        { name: "Dense", type: "dense", units: 128, activation: "relu" },
        { name: "Output", type: "output", units: 10, activation: "softmax" },
      ],
    };
    expect(neuralSchema.safeParse(data).success).toBe(true);
  });

  it("rejects missing layers", () => {
    const data = {
      type: "neural",
      version: "1.0",
    };
    expect(neuralSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      layers: [{ name: "Input", type: "input", units: 10 }],
    };
    expect(neuralSchema.safeParse(data).success).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "neural",
      layers: [{ name: "Input", type: "input", units: 10 }],
    };
    expect(neuralSchema.safeParse(data).success).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      layers: [{ name: "Input", type: "input", units: 10 }],
    };
    expect(neuralSchema.safeParse(data).success).toBe(false);
  });

  it("rejects invalid layer type", () => {
    const data = {
      type: "neural",
      version: "1.0",
      layers: [{ name: "Layer", type: "lstm", units: 32 }],
    };
    expect(neuralSchema.safeParse(data).success).toBe(false);
  });
});
