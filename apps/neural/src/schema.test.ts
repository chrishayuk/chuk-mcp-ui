import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import schema from "../schemas/input.json";

const ajv = new Ajv();
const validate = ajv.compile(schema);

describe("neural schema validation", () => {
  it("accepts minimal valid neural network", () => {
    const data = {
      type: "neural",
      version: "1.0",
      layers: [
        { name: "Input", type: "input", units: 784 },
        { name: "Output", type: "output", units: 10 },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts neural network with all options", () => {
    const data = {
      type: "neural",
      version: "1.0",
      title: "Image Classifier",
      layers: [
        { name: "Input", type: "input", units: 784, color: "#3b82f6" },
        { name: "Hidden 1", type: "dense", units: 128, activation: "relu", color: "#22c55e" },
        { name: "Dropout", type: "dropout", units: 128 },
        { name: "Hidden 2", type: "dense", units: 64, activation: "relu" },
        { name: "Output", type: "output", units: 10, activation: "softmax" },
      ],
      showWeights: true,
    };
    expect(validate(data)).toBe(true);
  });

  it("accepts all layer types", () => {
    const types = ["input", "dense", "conv", "pooling", "dropout", "output"];
    for (const layerType of types) {
      const data = {
        type: "neural",
        version: "1.0",
        layers: [{ name: "Layer", type: layerType, units: 32 }],
      };
      expect(validate(data)).toBe(true);
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
    expect(validate(data)).toBe(true);
  });

  it("accepts CNN architecture", () => {
    const data = {
      type: "neural",
      version: "1.0",
      title: "CNN",
      layers: [
        { name: "Input", type: "input", units: 1024 },
        { name: "Conv1", type: "conv", units: 32 },
        { name: "Pool1", type: "pooling", units: 16 },
        { name: "Conv2", type: "conv", units: 64 },
        { name: "Pool2", type: "pooling", units: 8 },
        { name: "FC", type: "dense", units: 128 },
        { name: "Output", type: "output", units: 10 },
      ],
    };
    expect(validate(data)).toBe(true);
  });

  it("rejects missing layers", () => {
    const data = {
      type: "neural",
      version: "1.0",
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing type", () => {
    const data = {
      version: "1.0",
      layers: [{ name: "Input", type: "input", units: 10 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects missing version", () => {
    const data = {
      type: "neural",
      layers: [{ name: "Input", type: "input", units: 10 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects wrong type", () => {
    const data = {
      type: "chart",
      version: "1.0",
      layers: [{ name: "Input", type: "input", units: 10 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects invalid layer type", () => {
    const data = {
      type: "neural",
      version: "1.0",
      layers: [{ name: "Layer", type: "lstm", units: 32 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects layer missing name", () => {
    const data = {
      type: "neural",
      version: "1.0",
      layers: [{ type: "input", units: 10 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects layer missing units", () => {
    const data = {
      type: "neural",
      version: "1.0",
      layers: [{ name: "Input", type: "input" }],
    };
    expect(validate(data)).toBe(false);
  });

  it("rejects layer missing type", () => {
    const data = {
      type: "neural",
      version: "1.0",
      layers: [{ name: "Input", units: 10 }],
    };
    expect(validate(data)).toBe(false);
  });

  it("accepts unknown additional fields", () => {
    const data = {
      type: "neural",
      version: "1.0",
      layers: [{ name: "Input", type: "input", units: 10 }],
      extra: true,
    };
    expect(validate(data)).toBe(true);
  });
});
