import { renderToString } from "react-dom/server";
import { GisLegendRenderer } from "./App";
import type { GisLegendContent } from "./schema";

export function render(data: GisLegendContent): string {
  return renderToString(<GisLegendRenderer data={data} />);
}
