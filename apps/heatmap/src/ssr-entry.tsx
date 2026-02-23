import { renderToString } from "react-dom/server";
import { HeatmapRenderer } from "./App";
import type { HeatmapContent } from "./schema";

export function render(data: HeatmapContent): string {
  return renderToString(<HeatmapRenderer data={data} />);
}
