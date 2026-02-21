import type { Meta, StoryObj } from "@storybook/react";
import { NeuralRenderer } from "./App";
import type { NeuralContent } from "./schema";

const meta = {
  title: "Views/Neural",
  component: NeuralRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof NeuralRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Story 1: SimpleClassifier                                          */
/* ------------------------------------------------------------------ */

export const SimpleClassifier: Story = {
  args: {
    data: {
      type: "neural",
      version: "1.0",
      title: "MNIST Digit Classifier",
      layers: [
        { name: "Input", type: "input", units: 784 },
        { name: "Hidden 1", type: "dense", units: 128 },
        { name: "Hidden 2", type: "dense", units: 64 },
        { name: "Output", type: "output", units: 10 },
      ],
    } satisfies NeuralContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 2: CNN                                                       */
/* ------------------------------------------------------------------ */

export const CNN: Story = {
  args: {
    data: {
      type: "neural",
      version: "1.0",
      title: "Convolutional Neural Network",
      showWeights: true,
      layers: [
        { name: "Input", type: "input", units: 1024 },
        { name: "Conv1", type: "conv", units: 32 },
        { name: "Pool1", type: "pooling", units: 16 },
        { name: "Conv2", type: "conv", units: 64 },
        { name: "Pool2", type: "pooling", units: 8 },
        { name: "FC", type: "dense", units: 128 },
        { name: "Output", type: "output", units: 10 },
      ],
    } satisfies NeuralContent,
  },
};

/* ------------------------------------------------------------------ */
/*  Story 3: WithActivations                                           */
/* ------------------------------------------------------------------ */

export const WithActivations: Story = {
  args: {
    data: {
      type: "neural",
      version: "1.0",
      title: "Network with Activations",
      layers: [
        { name: "Input", type: "input", units: 256 },
        { name: "Dense 1", type: "dense", units: 128, activation: "relu" },
        { name: "Dropout", type: "dropout", units: 128 },
        { name: "Dense 2", type: "dense", units: 64, activation: "relu" },
        { name: "Dense 3", type: "dense", units: 32, activation: "tanh" },
        { name: "Output", type: "output", units: 5, activation: "softmax" },
      ],
    } satisfies NeuralContent,
  },
};
