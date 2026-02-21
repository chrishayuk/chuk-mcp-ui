export interface NeuralLayer {
  name: string;
  type: "input" | "dense" | "conv" | "pooling" | "dropout" | "output";
  units: number;
  activation?: string;
  color?: string;
}

export interface NeuralContent {
  type: "neural";
  version: "1.0";
  title?: string;
  layers: NeuralLayer[];
  showWeights?: boolean;
}
