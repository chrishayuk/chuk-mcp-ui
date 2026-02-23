import { renderToString } from "react-dom/server";
import { ChartRendererStatic } from "./App";
import type { ChartContent } from "./schema";

export function render(data: ChartContent): string {
  return renderToString(<ChartRendererStatic data={data} />);
}
