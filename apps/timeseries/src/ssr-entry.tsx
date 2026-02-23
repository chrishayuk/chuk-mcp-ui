import { renderToString } from "react-dom/server";
import { TimeseriesRenderer } from "./App";
import type { TimeseriesContent } from "./schema";

export function render(data: TimeseriesContent): string {
  return renderToString(<TimeseriesRenderer data={data} />);
}
