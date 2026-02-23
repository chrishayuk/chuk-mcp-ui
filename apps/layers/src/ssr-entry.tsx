import { renderToString } from "react-dom/server";
import { LayersRenderer } from "./App";
import type { LayersContent } from "./schema";

export function render(data: LayersContent): string {
  return renderToString(<LayersRenderer data={data} />);
}
