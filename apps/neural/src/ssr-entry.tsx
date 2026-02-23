import { renderToString } from "react-dom/server";
import { NeuralRenderer } from "./App";
import type { NeuralContent } from "./schema";

export function render(data: NeuralContent): string {
  return renderToString(<NeuralRenderer data={data} />);
}
